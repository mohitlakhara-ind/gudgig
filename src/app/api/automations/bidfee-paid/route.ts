import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/webpush';

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail, amount, jobTitle } = await req.json();
    if (!userId || !userEmail || typeof amount !== 'number') {
      return NextResponse.json({ success: false, message: 'userId, userEmail, amount required' }, { status: 400 });
    }
    const notif = notificationService.createNotification({
      type: 'payment_success',
      title: 'Bid Fee Paid',
      message: jobTitle ? `Bid fee of ₹${amount} paid for "${jobTitle}".` : `Bid fee of ₹${amount} paid.`,
      userId,
      data: { amount, jobTitle }
    });
    await sendPushToUser(String(userId), { title: notif.title, body: notif.message, data: notif });
    return NextResponse.json({ success: true, data: notif });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to trigger bidfee-paid' }, { status: 500 });
  }
}



