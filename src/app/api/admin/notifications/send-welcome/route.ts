import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/webpush';

// Simple endpoint to send a welcome message to all users
export async function POST(request: NextRequest) {
  try {
    // Default welcome message
    const welcomeMessage = {
      title: 'Welcome to Gudgig! 🎉',
      message: `Welcome to Gudgig! We're excited to have you join our professional freelancer marketplace!

Here's what you can do on Gudgig:
• Browse and apply to amazing freelance opportunities
• Connect with top-tier clients and employers  
• Build your professional portfolio
• Get paid securely through our platform

Start exploring gigs and take your freelance career to the next level!

Best regards,
The Gudgig Team`
    };

    // Mock user data - in production, fetch from database
    const users = [
      { id: 'user_1', email: 'alice@gudgig.com', name: 'Alice Cooper', role: 'freelancer' },
      { id: 'user_2', email: 'bob@gudgig.com', name: 'Bob Smith', role: 'employer' },
      { id: 'user_3', email: 'charlie@gudgig.com', name: 'Charlie Brown', role: 'freelancer' },
      { id: 'admin_1', email: 'admin@gudgig.com', name: 'Admin User', role: 'admin' },
      { id: 'user_4', email: 'diana@gudgig.com', name: 'Diana Prince', role: 'employer' },
      { id: 'user_5', email: 'eve@gudgig.com', name: 'Eve Wilson', role: 'freelancer' },
    ];

    let successCount = 0;
    const results = [];

    // Send welcome message to each user
    for (const user of users) {
      try {
        // Create notification
        const notification = notificationService.createNotification({
          type: 'admin_message',
          title: welcomeMessage.title,
          message: welcomeMessage.message,
          userId: user.id,
          data: {
            broadcastType: 'welcome',
            sentAt: new Date().toISOString(),
            recipientRole: user.role
          }
        });

        // Send push notification
        try {
          await sendPushToUser(user.id, {
            title: welcomeMessage.title,
            body: welcomeMessage.message,
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
        totalUsers: users.length,
        successCount,
        results
      }
    });

  } catch (error) {
    console.error('Error sending welcome message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send welcome message' },
      { status: 500 }
    );
  }
}


