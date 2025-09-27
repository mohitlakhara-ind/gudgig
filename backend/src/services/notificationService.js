import User from '../models/User.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';

class NotificationService {
  constructor() {
    // Initialize with null values - will be set up asynchronously
    this.emailTransporter = null;
    this.twilioClient = null;
    this.webpush = null;

    this.templates = {
      jobApplicationReceived: this.jobApplicationReceivedTemplate,
      interviewScheduled: this.interviewScheduledTemplate,
      applicationStatusUpdate: this.applicationStatusUpdateTemplate,
      jobPostedConfirmation: this.jobPostedConfirmationTemplate,
      subscriptionActivated: this.subscriptionActivatedTemplate,
      subscriptionPaymentFailed: this.subscriptionPaymentFailedTemplate,
      subscriptionCancelled: this.subscriptionCancelledTemplate,
      subscriptionRenewalReminder: this.subscriptionRenewalReminderTemplate,
      passwordReset: this.passwordResetTemplate,
      securityAlert: this.securityAlertTemplate
    };

    // Readiness handling
    this._initialized = false;
    this.initPromise = this.initializeServices();
  }

  async initializeServices() {
    try {
      // Dynamic import for nodemailer
      const nodemailer = await import('nodemailer');
      this.emailTransporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Dynamic import for twilio (align env names)
      const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
      const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN;
      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        const twilio = await import('twilio');
        this.twilioClient = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      }

      // Dynamic import for web-push (align VAPID subject)
      if (process.env.VAPID_PUBLIC_KEY) {
        const webpush = await import('web-push');
        const vapidSubject = process.env.VAPID_SUBJECT || (process.env.VAPID_EMAIL ? `mailto:${process.env.VAPID_EMAIL}` : undefined);
        if (!vapidSubject) {
          console.warn('[notificationService] VAPID_SUBJECT is missing; set VAPID_SUBJECT (e.g., mailto:admin@example.com)');
        }
        webpush.default.setVapidDetails(
          vapidSubject || 'mailto:admin@example.com',
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        this.webpush = webpush.default;
      }
      this._initialized = true;
      this._validateEnvAtRuntime();
    } catch (error) {
      console.error('Error initializing notification services:', error);
    }
  }

  _validateEnvAtRuntime() {
    // Email warnings
    const missingEmail = !process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS;
    if (missingEmail) {
      console.warn('[notificationService] SMTP not fully configured; sendEmail will fail. Missing one of SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS');
    }

    // Twilio warnings
    const hasTwilio = (process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID) && (process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN);
    if (!hasTwilio) {
      console.warn('[notificationService] Twilio not configured; sendSMS/sendWhatsApp will be disabled. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
    }
    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.warn('[notificationService] TWILIO_PHONE_NUMBER not set; sendSMS will fail.');
    }
    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      console.warn('[notificationService] TWILIO_WHATSAPP_NUMBER not set (format whatsapp:+E164); sendWhatsApp will fail.');
    }

    // Webpush warnings
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.warn('[notificationService] VAPID keys missing; sendPushNotification will be disabled.');
    }
  }

  // Multi-channel notification sending
  async sendNotification(userId, type, data, channels = ['email']) {
    try {
      const user = await User.findById(userId).select('email phone notificationPreferences');
      if (!user) throw new Error('User not found');

      const preferences = user.notificationPreferences || {};
      const results = [];

      for (const channel of channels) {
        if (preferences[channel] !== false) { // Default to true if not set
          try {
            const result = await this.sendToChannel(channel, user, type, data);
            results.push({ channel, success: true, result });
          } catch (error) {
            console.error(`Failed to send ${channel} notification:`, error);
            results.push({ channel, success: false, error: error.message });
          }
        }
      }

      // Log notification
      await this.logNotification(userId, type, results);

      return results;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  }

  // Send to specific channel
  async sendToChannel(channel, user, type, data) {
    const template = this.templates[type];
    if (!template) throw new Error(`Template ${type} not found`);

    const content = template(data);

    switch (channel) {
      case 'email':
        return await this.sendEmail(user.email, content.subject, content.html, content.text);

      case 'sms':
        if (user.phone) {
          return await this.sendSMS(user.phone, content.text);
        }
        break;

      case 'whatsapp':
        if (user.phone) {
          return await this.sendWhatsApp(user.phone, content.text || content.subject || '');
        }
        break;

      case 'push':
        return await this.sendPushNotification(user._id, content.title || content.subject, content.body || content.text, data);

      case 'inApp':
        return await this.sendInAppNotification(user._id, type, content, data);

      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  // Email sending
  async sendEmail(to, subject, html, text) {
    await this.initPromise;
    if (!this.emailTransporter) throw new Error('Email service not initialized');
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@microjobs.com',
      to,
      subject,
      html,
      text
    };

    const result = await this.emailTransporter.sendMail(mailOptions);
    return { messageId: result.messageId };
  }

  // SMS sending
  async sendSMS(to, message) {
    await this.initPromise;
    if (!this.twilioClient) throw new Error('Twilio not configured');

    const result = await this.twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    return { messageId: result.sid };
  }

  // WhatsApp sending via Twilio
  async sendWhatsApp(to, message) {
    await this.initPromise;
    if (!this.twilioClient) throw new Error('Twilio not configured');
    const from = process.env.TWILIO_WHATSAPP_NUMBER; // expected whatsapp:+E164
    if (!from) throw new Error('WhatsApp sender not configured');
    const normalizedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const result = await this.twilioClient.messages.create({
      body: message,
      from: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
      to: normalizedTo
    });
    return { messageId: result.sid };
  }

  // Push notification sending
  async sendPushNotification(userId, title, body, data = {}) {
    await this.initPromise;
    // In production, you'd store subscription endpoints per user
    // For now, this is a placeholder
    const subscription = await this.getUserPushSubscription(userId);
    if (!subscription) return null;

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon.png',
      badge: '/badge.png',
      data
    });

    if (!this.webpush) return null;
    const result = await this.webpush.sendNotification(subscription, payload);
    return { success: true };
  }

  // In-app notification
  async sendInAppNotification(userId, type, content, data) {
    // Store in database
    const notification = await Notification.create({
      user: userId,
      type,
      title: content.title,
      message: content.body,
      data,
      read: false
    });

    return { notificationId: notification._id };
  }

  // Create notification and emit real-time event
  async createNotification(userId, type, title, message, data = {}) {
    try {
      // Create notification in database
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        data
      });

      // Get the io instance from the app (we'll need to pass this in)
      const io = this.io;
      if (io && typeof io.to === 'function') {
        // Emit real-time notification to user's room
        io.to(`user:${userId}`).emit('notification:new', {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          read: notification.read,
          createdAt: notification.createdAt
        });
      }

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  // Set the Socket.io instance
  setSocketIO(io) {
    this.io = io;
  }

  // Notification preferences management
  async updateUserPreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences
    };

    await user.save();
    return user.notificationPreferences;
  }

  // Template system for compliance-required notifications
  jobApplicationReceivedTemplate(data) {
    return {
      subject: `Bid Received - ${data.jobTitle}`,
      html: `
        <h2>Bid Received</h2>
        <p>Dear ${data.applicantName},</p>
        <p>Your bid for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been received.</p>
        <p>Bid ID: ${data.applicationId}</p>
        <p>You will be notified of any updates regarding your bid status.</p>
        <br>
        <p>Best regards,<br>The MicroJobs Team</p>
      `,
      text: `Bid Received

Dear ${data.applicantName},

Your bid for ${data.jobTitle} at ${data.companyName} has been received.
Bid ID: ${data.applicationId}

You will be notified of any updates.

Best regards,
The MicroJobs Team`
    };
  }

  interviewScheduledTemplate(data) {
    return {
      subject: `Interview Scheduled - ${data.jobTitle}`,
      html: `
        <h2>Interview Scheduled</h2>
        <p>Congratulations! You have been selected for an interview.</p>
        <p><strong>Position:</strong> ${data.jobTitle}</p>
        <p><strong>Company:</strong> ${data.companyName}</p>
        <p><strong>Date & Time:</strong> ${data.interviewDate}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Interview Type:</strong> ${data.interviewType}</p>
        ${data.additionalInfo ? `<p><strong>Additional Information:</strong> ${data.additionalInfo}</p>` : ''}
        <br>
        <p>Please confirm your attendance by replying to this email.</p>
      `,
      text: `Interview Scheduled

Congratulations! You have been selected for an interview.

Position: ${data.jobTitle}
Company: ${data.companyName}
Date & Time: ${data.interviewDate}
Location: ${data.location}
Interview Type: ${data.interviewType}

Please confirm your attendance.`
    };
  }

  applicationStatusUpdateTemplate(data) {
    return {
      subject: `Application Status Update - ${data.jobTitle}`,
      html: `
        <h2>Application Status Update</h2>
        <p>Dear ${data.applicantName},</p>
        <p>Your application status for <strong>${data.jobTitle}</strong> has been updated.</p>
        <p><strong>New Status:</strong> ${data.status}</p>
        ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
        <br>
        <p>Thank you for using our platform.</p>
      `,
      text: `Application Status Update

Dear ${data.applicantName},

Your application status for ${data.jobTitle} has been updated.
New Status: ${data.status}

Thank you for using our platform.`
    };
  }

  // Subscription templates
  subscriptionActivatedTemplate(data) {
    return {
      subject: 'Subscription Activated',
      html: `
        <h2>Welcome to ${data.planName}</h2>
        <p>Your subscription is now active.</p>
        <p><strong>Plan:</strong> ${data.planName}</p>
        <p><strong>Billing Cycle:</strong> ${data.billingCycle}</p>
        <p><strong>Valid Until:</strong> ${data.currentPeriodEnd}</p>
      `,
      text: `Subscription Activated\n\nPlan: ${data.planName}\nBilling Cycle: ${data.billingCycle}\nValid Until: ${data.currentPeriodEnd}`
    };
  }

  subscriptionPaymentFailedTemplate(data) {
    return {
      subject: 'Payment Failed - Action Required',
      html: `
        <h2>Payment Failed</h2>
        <p>We couldn't process your subscription payment.</p>
        <p><strong>Reason:</strong> ${data.reason || 'Unknown'}</p>
        <p>Please update your payment method to avoid service interruption.</p>
      `,
      text: `Payment Failed\n\nReason: ${data.reason || 'Unknown'}\nPlease update your payment method.`
    };
  }

  subscriptionCancelledTemplate(_data) {
    return {
      subject: 'Subscription Cancelled',
      html: `
        <h2>Subscription Cancelled</h2>
        <p>Your subscription has been cancelled. You'll retain access until the end of your current billing period.</p>
      `,
      text: `Subscription Cancelled\n\nYou'll retain access until the end of your current billing period.`
    };
  }

  subscriptionRenewalReminderTemplate(data) {
    return {
      subject: 'Upcoming Subscription Renewal',
      html: `
        <h2>Renewal Reminder</h2>
        <p>Your subscription will renew on ${data.renewalDate}.</p>
        <p>If you wish to make changes, visit your subscription settings.</p>
      `,
      text: `Upcoming Subscription Renewal\n\nYour subscription will renew on ${data.renewalDate}.`
    };
  }

  jobPostedConfirmationTemplate(data) {
    return {
      subject: 'MicroJob Posted Successfully',
      html: `
        <h2>MicroJob Posted Successfully</h2>
        <p>Your microjob posting has been published!</p>
        <p><strong>MicroJob Title:</strong> ${data.jobTitle}</p>
        <p><strong>ID:</strong> ${data.jobId}</p>
        <p><strong>Posted on:</strong> ${data.postedDate}</p>
        <br>
        <p>You can view and manage your microjob in your employer dashboard.</p>
        <p>Bids will appear in your dashboard as freelancers bid.</p>
      `,
      text: `MicroJob Posted Successfully

Your microjob posting has been published!

MicroJob Title: ${data.jobTitle}
ID: ${data.jobId}
Posted on: ${data.postedDate}

You can manage your microjob in the employer dashboard.`
    };
  }

  passwordResetTemplate(data) {
    return {
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${data.resetLink}">Reset Password</a></p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `,
      text: `Password Reset

You requested a password reset.
Reset link: ${data.resetLink}
This link expires in 10 minutes.

If you didn't request this, ignore this email.`
    };
  }

  securityAlertTemplate(data) {
    return {
      subject: 'Security Alert - Account Activity',
      html: `
        <h2>Security Alert</h2>
        <p>We detected unusual activity on your account.</p>
        <p><strong>Activity:</strong> ${data.activity}</p>
        <p><strong>Time:</strong> ${data.timestamp}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <br>
        <p>If this was you, no action is needed.</p>
        <p>If this wasn't you, please change your password immediately and contact support.</p>
      `,
      text: `Security Alert

Unusual activity detected: ${data.activity}
Time: ${data.timestamp}
Location: ${data.location}

If this wasn't you, change your password immediately.`
    };
  }

  // Notification queuing and retry logic
  async queueNotification(userId, type, data, channels, delay = 0) {
    // In production, use a queue system like Bull or Redis
    const notification = {
      userId,
      type,
      data,
      channels,
      scheduledFor: new Date(Date.now() + delay),
      status: 'queued',
      retries: 0
    };

    // Store in queue
    setTimeout(() => {
      this.processQueuedNotification(notification);
    }, delay);

    return notification;
  }

  async processQueuedNotification(notification) {
    try {
      await this.sendNotification(
        notification.userId,
        notification.type,
        notification.data,
        notification.channels
      );
      notification.status = 'sent';
    } catch (error) {
      notification.retries++;
      if (notification.retries < 3) {
        // Retry with exponential backoff
        setTimeout(() => {
          this.processQueuedNotification(notification);
        }, Math.pow(2, notification.retries) * 1000);
      } else {
        notification.status = 'failed';
      }
    }
  }

  // Notification analytics and delivery tracking
  async logNotification(userId, type, results) {
    // In production, store delivery analytics
    console.log(`Notification sent to user ${userId}: ${type}`, results);
  }

  // Automated notification workflows
  async triggerApplicationWorkflow(application) {
    const job = await Job.findById(application.job).populate('employer company');

    // Notify employer
    await this.queueNotification(
      job.employer._id,
      'jobApplicationReceived',
      {
        applicantName: application.applicant.name,
        jobTitle: job.title,
        companyName: job.company.name,
        applicationId: application._id
      },
      ['email', 'inApp']
    );

    // Notify applicant
    await this.queueNotification(
      application.applicant._id,
      'applicationStatusUpdate',
      {
        applicantName: application.applicant.name,
        jobTitle: job.title,
        status: 'Received',
        message: 'Your application has been received and is under review.'
      },
      ['email', 'inApp']
    );
  }

  // Notification personalization
  async personalizeNotification(userId, type, baseData) {
    const user = await User.findById(userId).select('name preferences');

    // Add user-specific personalization
    const personalizedData = {
      ...baseData,
      recipientName: user.name,
      // Add preferences-based customization
      ...this.getPersonalizationFromPreferences(user.preferences)
    };

    return personalizedData;
  }

  getPersonalizationFromPreferences(preferences) {
    // Return personalization settings based on user preferences
    return {
      tone: preferences?.communicationTone || 'professional',
      frequency: preferences?.notificationFrequency || 'immediate'
    };
  }

  // Emergency notification capabilities
  async sendEmergencyNotification(userIds, message, priority = 'high') {
    const notifications = userIds.map(userId =>
      this.sendNotification(userId, 'securityAlert', { message, priority }, ['email', 'sms', 'push'])
    );

    return await Promise.allSettled(notifications);
  }

  // Helper methods
  async getUserPushSubscription(userId) {
    // In production, retrieve from database
    return null; // Placeholder
  }
}

export default new NotificationService();