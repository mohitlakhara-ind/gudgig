import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/webpush';

// Broadcast a welcome message to all users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, includeAdmins = true } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Title and message are required' },
        { status: 400 }
      );
    }

    // In a real application, you would fetch all users from your database
    // For now, we'll use mock user data
    const mockUsers = [
      { id: 'user_1', email: 'alice@gigsmint.com', name: 'Alice Cooper', role: 'freelancer' },
      { id: 'user_2', email: 'bob@gigsmint.com', name: 'Bob Smith', role: 'employer' },
      { id: 'user_3', email: 'charlie@gigsmint.com', name: 'Charlie Brown', role: 'freelancer' },
      { id: 'admin_1', email: 'admin@gigsmint.com', name: 'Admin User', role: 'admin' },
      { id: 'user_4', email: 'diana@gigsmint.com', name: 'Diana Prince', role: 'employer' },
      { id: 'user_5', email: 'eve@gigsmint.com', name: 'Eve Wilson', role: 'freelancer' },
    ];

    // Filter users based on includeAdmins flag
    const targetUsers = includeAdmins 
      ? mockUsers 
      : mockUsers.filter(user => user.role !== 'admin');

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    // Send notifications to each user
    for (const user of targetUsers) {
      try {
        // Create notification in the system
        const notification = notificationService.createNotification({
          type: 'admin_message',
          title,
          message,
          userId: user.id,
          data: {
            broadcastType: 'welcome',
            sentAt: new Date().toISOString(),
            recipientRole: user.role
          }
        });

        // Send push notification if user has subscribed
        try {
          await sendPushToUser(user.id, {
            title,
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'welcome-message',
            data: {
              url: '/notifications',
              notificationId: notification.id,
              type: 'admin_message'
            }
          });
        } catch (pushError) {
          console.warn(`Push notification failed for user ${user.id}:`, pushError);
          // Continue even if push fails
        }

        successCount++;
        results.push({
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: 'success'
        });

      } catch (error) {
        failureCount++;
        results.push({
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Welcome message sent to ${successCount} users`,
      data: {
        totalUsers: targetUsers.length,
        successCount,
        failureCount,
        results
      }
    });

  } catch (error) {
    console.error('Error broadcasting welcome message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to broadcast welcome message' },
      { status: 500 }
    );
  }
}


