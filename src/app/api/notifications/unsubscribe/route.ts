import { NextRequest, NextResponse } from 'next/server';
import { removeSubscription } from '@/lib/webpush';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, endpoint } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const removed = removeSubscription(userId, endpoint);

    if (!removed) {
      return NextResponse.json({ success: true, message: 'No matching subscription found' });
    }

    console.log(`Push subscription removed for user ${userId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription removed successfully' 
    });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}



