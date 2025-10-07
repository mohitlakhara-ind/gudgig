import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/webpush';

// NOTE: Add proper admin auth in middleware in production

export async function POST(req: NextRequest) {
  try {
    const { userIds, title, message, data } = await req.json();
    const ids: string[] = Array.isArray(userIds) ? userIds : userIds ? [String(userIds)] : [];
    if (!ids.length || !title || !message) {
      return NextResponse.json({ success: false, message: 'userIds, title, message required' }, { status: 400 });
    }
    const results: any[] = [];
    for (const userId of ids) {
      const notif = notificationService.createNotification({
        type: 'admin_message',
        title,
        message,
        userId,
        data: data || {}
      });
      await sendPushToUser(String(userId), { title, body: message, data: notif });
      results.push(notif);
    }
    return NextResponse.json({ success: true, data: { count: results.length, notifications: results } });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to send notifications' }, { status: 500 });
  }
}



