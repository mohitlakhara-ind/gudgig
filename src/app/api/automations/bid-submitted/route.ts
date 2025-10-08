import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/webpush';

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail, userName, jobTitle, quotation, bidFee } = await req.json();
    if (!userId || !userEmail || !jobTitle || !quotation) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const notif = notificationService.createNotification({
      type: 'bid_submitted',
      title: 'Bid Submitted Successfully',
      message: `Your bid for "${jobTitle}" has been submitted successfully.`,
      userId,
      data: { userName, jobTitle, quotation, bidFee }
    });

    await sendPushToUser(String(userId), {
      title: notif.title,
      body: notif.message,
      data: { url: '/bids', notificationId: notif.id }
    });

    return NextResponse.json({ success: true, data: notif });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to trigger bid-submitted' }, { status: 500 });
  }
}


