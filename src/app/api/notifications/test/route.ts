import { NextRequest, NextResponse } from 'next/server';
import { sendPushToUser } from '@/lib/webpush';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Send test notification
    const payload = {
      title: 'Test Notification',
      body: 'This is a test notification from Gigs Mint!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification',
      data: {
        url: '/notifications',
        timestamp: Date.now(),
      },
    };

    const result = await sendPushToUser(userId, payload);

    if (result.sent === 0 && result.failed > 0) {
      return NextResponse.json(
        { error: 'No active subscriptions found for user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification sent successfully',
      result 
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}



