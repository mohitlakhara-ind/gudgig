// Simple notification system for Gigs Mint
// This can be extended with email services like SendGrid, AWS SES, etc.

export interface Notification {
  id: string;
  type: 'welcome' | 'gig_sent' | 'bid_submitted' | 'bid_accepted' | 'bid_rejected' | 'payment_success' | 'payment_failed' | 'admin_message';
  title: string;
  message: string;
  userId: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class NotificationService {
  private notifications: Notification[] = [];

  // Create a new notification
  createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString()
    };

    this.notifications.push(newNotification);
    return newNotification;
  }

  // Get notifications for a user
  getUserNotifications(userId: string, limit = 50): Notification[] {
    return this.notifications
      .filter(notif => notif.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Mark notification as read
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(notif => notif.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId: string): number {
    let count = 0;
    this.notifications.forEach(notif => {
      if (notif.userId === userId && !notif.read) {
        notif.read = true;
        count++;
      }
    });
    return count;
  }

  // Get unread count for a user
  getUnreadCount(userId: string): number {
    return this.notifications.filter(notif => notif.userId === userId && !notif.read).length;
  }

  // Email templates
  getEmailTemplate(type: string, data: Record<string, any>): EmailTemplate {
    switch (type) {
      case 'welcome':
        return {
          subject: `Welcome to Gigs Mint, ${data.userName || 'there'}!`,
          html: `<p>Welcome to Gigs Mint! We are glad you're here.</p>`,
          text: `Welcome to Gigs Mint! We are glad you're here.`
        };

      case 'gig_sent':
        return {
          subject: `Your gig was sent - ${data.jobTitle || ''}`,
          html: `<p>Your gig has been sent successfully${data.jobTitle ? ` for <strong>${data.jobTitle}</strong>` : ''}.</p>`,
          text: `Your gig has been sent successfully${data.jobTitle ? ` for ${data.jobTitle}` : ''}.`
        };
      case 'bid_submitted':
        return {
          subject: `Bid Submitted Successfully - ${data.jobTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0966C2;">Bid Submitted Successfully!</h2>
              <p>Hello ${data.userName},</p>
              <p>Your bid has been successfully submitted for the project: <strong>${data.jobTitle}</strong></p>
              <p><strong>Your Quotation:</strong> ₹${data.quotation}</p>
              <p><strong>Bid Fee Paid:</strong> ₹${data.bidFee}</p>
              <p>You will be notified when the client reviews your bid.</p>
              <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0; color: #666;">Thank you for using Gigs Mint!</p>
              </div>
            </div>
          `,
          text: `Bid Submitted Successfully!\n\nHello ${data.userName},\n\nYour bid has been successfully submitted for the project: ${data.jobTitle}\n\nYour Quotation: ₹${data.quotation}\nBid Fee Paid: ₹${data.bidFee}\n\nYou will be notified when the client reviews your bid.\n\nThank you for using Gigs Mint!`
        };

      case 'bid_accepted':
        return {
          subject: `🎉 Congratulations! Your Bid Was Accepted - ${data.jobTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">🎉 Congratulations!</h2>
              <p>Hello ${data.userName},</p>
              <p>Great news! Your bid has been accepted for the project: <strong>${data.jobTitle}</strong></p>
              <p><strong>Your Quotation:</strong> ₹${data.quotation}</p>
              <p>The client will contact you soon to discuss the project details.</p>
              <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #166534;"><strong>Next Steps:</strong></p>
                <ul style="margin: 10px 0; color: #166534;">
                  <li>Check your messages for client communication</li>
                  <li>Review project requirements carefully</li>
                  <li>Prepare to start the project</li>
                </ul>
              </div>
            </div>
          `,
          text: `🎉 Congratulations!\n\nHello ${data.userName},\n\nGreat news! Your bid has been accepted for the project: ${data.jobTitle}\n\nYour Quotation: ₹${data.quotation}\n\nThe client will contact you soon to discuss the project details.\n\nNext Steps:\n- Check your messages for client communication\n- Review project requirements carefully\n- Prepare to start the project\n\nThank you for using Gigs Mint!`
        };

      case 'bid_rejected':
        return {
          subject: `Update on Your Bid - ${data.jobTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Bid Update</h2>
              <p>Hello ${data.userName},</p>
              <p>We wanted to let you know that your bid for <strong>${data.jobTitle}</strong> was not selected this time.</p>
              <p><strong>Your Quotation:</strong> ₹${data.quotation}</p>
              <p>Don't worry! There are many more opportunities available on our platform.</p>
              <div style="margin-top: 30px; padding: 20px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #991b1b;"><strong>Keep Going:</strong></p>
                <ul style="margin: 10px 0; color: #991b1b;">
                  <li>Browse more available projects</li>
                  <li>Improve your proposal writing skills</li>
                  <li>Consider adjusting your pricing strategy</li>
                </ul>
              </div>
            </div>
          `,
          text: `Bid Update\n\nHello ${data.userName},\n\nWe wanted to let you know that your bid for ${data.jobTitle} was not selected this time.\n\nYour Quotation: ₹${data.quotation}\n\nDon't worry! There are many more opportunities available on our platform.\n\nKeep Going:\n- Browse more available projects\n- Improve your proposal writing skills\n- Consider adjusting your pricing strategy\n\nThank you for using Gigs Mint!`
        };

      case 'payment_success':
        return {
          subject: `Payment Successful - ₹${data.amount}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Payment Successful!</h2>
              <p>Hello ${data.userName},</p>
              <p>Your payment of <strong>₹${data.amount}</strong> has been processed successfully.</p>
              <p><strong>Payment ID:</strong> ${data.paymentId}</p>
              <p><strong>Description:</strong> ${data.description}</p>
              <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                <p style="margin: 0; color: #166534;">Thank you for your payment. You can now proceed with your bid submission.</p>
              </div>
            </div>
          `,
          text: `Payment Successful!\n\nHello ${data.userName},\n\nYour payment of ₹${data.amount} has been processed successfully.\n\nPayment ID: ${data.paymentId}\nDescription: ${data.description}\n\nThank you for your payment. You can now proceed with your bid submission.`
        };

      case 'admin_message':
        return {
          subject: `New Message from Admin - ${data.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0966C2;">Message from Admin</h2>
              <p>Hello ${data.userName},</p>
              <p><strong>Subject:</strong> ${data.subject}</p>
              <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0;">${data.message}</p>
              </div>
              <p>Please log in to your dashboard to respond to this message.</p>
            </div>
          `,
          text: `Message from Admin\n\nHello ${data.userName},\n\nSubject: ${data.subject}\n\n${data.message}\n\nPlease log in to your dashboard to respond to this message.`
        };

      default:
        return {
          subject: 'Notification from Gigs Mint',
          html: '<p>You have a new notification from Gigs Mint.</p>',
          text: 'You have a new notification from Gigs Mint.'
        };
    }
  }

  // Send email notification (mock implementation)
  async sendEmailNotification(userEmail: string, template: EmailTemplate): Promise<boolean> {
    try {
      // In a real implementation, you would integrate with an email service
      // like SendGrid, AWS SES, or Nodemailer
      // Swallow logs in production; optionally integrate with Sentry breadcrumbs here
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      // In a real implementation, forward to centralized logger
      return false;
    }
  }

  // Send notification with email
  async sendNotificationWithEmail(
    userId: string,
    userEmail: string,
    type: string,
    data: Record<string, any>
  ): Promise<Notification | null> {
    try {
      // Create notification
      const notification = this.createNotification({
        type: type as any,
        title: data.title || 'New Notification',
        message: data.message || 'You have a new notification',
        userId,
        data
      });

      // Send email
      const template = this.getEmailTemplate(type, data);
      await this.sendEmailNotification(userEmail, template);

      return notification;
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Helper functions for common notification types
export const notifyBidSubmitted = async (userId: string, userEmail: string, data: {
  userName: string;
  jobTitle: string;
  quotation: string;
  bidFee: number;
}) => {
  return notificationService.sendNotificationWithEmail(
    userId,
    userEmail,
    'bid_submitted',
    {
      title: 'Bid Submitted Successfully',
      message: `Your bid for "${data.jobTitle}" has been submitted successfully.`,
      ...data
    }
  );
};

export const notifyBidAccepted = async (userId: string, userEmail: string, data: {
  userName: string;
  jobTitle: string;
  quotation: string;
}) => {
  return notificationService.sendNotificationWithEmail(
    userId,
    userEmail,
    'bid_accepted',
    {
      title: '🎉 Bid Accepted!',
      message: `Congratulations! Your bid for "${data.jobTitle}" has been accepted.`,
      ...data
    }
  );
};

export const notifyBidRejected = async (userId: string, userEmail: string, data: {
  userName: string;
  jobTitle: string;
  quotation: string;
}) => {
  return notificationService.sendNotificationWithEmail(
    userId,
    userEmail,
    'bid_rejected',
    {
      title: 'Bid Update',
      message: `Your bid for "${data.jobTitle}" was not selected this time.`,
      ...data
    }
  );
};

export const notifyPaymentSuccess = async (userId: string, userEmail: string, data: {
  userName: string;
  amount: number;
  paymentId: string;
  description: string;
}) => {
  return notificationService.sendNotificationWithEmail(
    userId,
    userEmail,
    'payment_success',
    {
      title: 'Payment Successful',
      message: `Your payment of ₹${data.amount} has been processed successfully.`,
      ...data
    }
  );
};

export const notifyAdminMessage = async (userId: string, userEmail: string, data: {
  userName: string;
  subject: string;
  message: string;
}) => {
  return notificationService.sendNotificationWithEmail(
    userId,
    userEmail,
    'admin_message',
    {
      title: 'Message from Admin',
      message: data.message,
      ...data
    }
  );
};


