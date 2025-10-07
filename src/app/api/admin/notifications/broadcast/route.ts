import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/webpush';

// Broadcast a notification to all users from backend DB
// Requires Authorization header with admin privileges
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { title, message, data } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'title and message required' }, { status: 400 });
    }

    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

    let page = 1;
    const limit = 100;
    let totalProcessed = 0;
    let sent = 0;
    let failed = 0;

    while (page < 1000) { // hard stop to avoid infinite loops
      const url = `${backendBase}/admin/users?page=${page}&limit=${limit}`;
      const resp = await fetch(url, {
        headers: { 'content-type': 'application/json', authorization: authHeader },
      });
      if (!resp.ok) break;
      const json = await resp.json();
      const users = json?.data?.users || json?.users || [];
      if (!Array.isArray(users) || users.length === 0) break;

      for (const u of users) {
        const userId = String(u?._id || u?.id || '');
        if (!userId) continue;
        const notif = notificationService.createNotification({
          type: 'admin_message',
          title,
          message,
          userId,
          data: data || { trial: true }
        });
        try {
          const r = await sendPushToUser(userId, { title, body: message, data: notif });
          sent += r.sent;
          failed += r.failed;
        } catch {
          failed += 1;
        }
        totalProcessed += 1;
      }

      // Stop if last page
      const pages = json?.data?.pages ?? json?.pages;
      if (pages && page >= pages) break;
      if (users.length < limit && !pages) break;
      page += 1;
    }

    return NextResponse.json({ success: true, data: { processed: totalProcessed, sent, failed } });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to broadcast notifications' }, { status: 500 });
  }
}



