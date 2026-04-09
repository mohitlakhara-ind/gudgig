import User from '../models/User.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import NotificationQueue from '../models/NotificationQueue.js';
import { wrapInBaseLayout } from '../utils/mailTemplates.js';

class NotificationService {
  constructor() {
    // Initialize with null values - will be set up asynchronously
    this.emailTransporter = null;
    this.twilioClient = null;
    this.webpush = null;

    this.templates = {
      jobApplicationReceived: this.jobApplicationReceivedTemplate,
      newGigPosted: this.newGigPostedTemplate,
      interviewScheduled: this.interviewScheduledTemplate,
      applicationStatusUpdate: this.applicationStatusUpdateTemplate,
      jobPostedConfirmation: this.jobPostedConfirmationTemplate,
      gigUnlocked: this.gigUnlockedTemplate,
      contactUnlocked: this.contactUnlockedTemplate,
      gigUpdated: this.gigUpdatedTemplate,
      gigHidden: this.gigHiddenTemplate,
      gigUnhidden: this.gigUnhiddenTemplate,
      subscriptionActivated: this.subscriptionActivatedTemplate,
      subscriptionPaymentFailed: this.subscriptionPaymentFailedTemplate,
      subscriptionCancelled: this.subscriptionCancelledTemplate,
      subscriptionRenewalReminder: this.subscriptionRenewalReminderTemplate,
      passwordReset: this.passwordResetTemplate,
      securityAlert: this.securityAlertTemplate,
      otp: this.otpTemplate
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
      try {
        await this.emailTransporter.verify();
        console.log('[notificationService] SMTP verified and ready');
      } catch (verifyErr) {
        console.warn('[notificationService] SMTP verification failed:', verifyErr?.message || verifyErr);
      }

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
          console.warn('[notificationService] VAPID_SUBJECT is missing; set VAPID_SUBJECT (e.g., mailto:info@gudgig.com)');
        }
        webpush.default.setVapidDetails(
          vapidSubject || 'mailto:info@gudgig.com',
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
      const user = await User.findById(userId).select('email phone notificationPreferences preferences');
      if (!user) throw new Error('User not found');

      const preferences = user.notificationPreferences || {};
      const results = [];
      let createdNotificationId = null;

      // Priority routing per type
      const priority = this.getPriorityForType(type);
      const desiredChannels = this.resolveChannels(priority, channels);

      // Quiet hours handling: restrict to inApp during quiet hours, queue email for later
      const quiet = this.isWithinQuietHours(user.preferences);
      const effectiveChannels = quiet
        ? Array.from(new Set(['inApp', ...desiredChannels.filter(c => c === 'inApp')]))
        : desiredChannels;

      // Dedupe: skip if identical recent notification sent within window
      const skip = await this.isDuplicateRecently(userId, type, data, 5 * 60 * 1000);
      if (skip) {
        return [{ channel: 'dedupe', success: true, result: 'skipped_duplicate' }];
      }

      for (const channel of effectiveChannels) {
        if (preferences[channel] !== false) { // Default to true if not set
          try {
            const result = await this.sendToChannel(channel, user, type, data);
            if (result?.notificationId && !createdNotificationId) {
              createdNotificationId = result.notificationId;
            }
            results.push({ channel, success: true, result });
          } catch (error) {
            console.error(`Failed to send ${channel} notification:`, error);
            results.push({ channel, success: false, error: error.message });
          }
        }
      }

      // Log notification
      await this.logNotification(userId, type, results);

      // If quiet hours and email desired but not sent, schedule an email after quiet hours
      if (quiet && desiredChannels.includes('email') && preferences.email !== false) {
        const delay = this.msUntilQuietHoursEnd(user.preferences);
        await this.queueNotification(userId, type, data, ['email'], delay);
      }

      return { results, notificationId: createdNotificationId };
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  }

  // Send to specific channel
  async sendToChannel(channel, user, type, data) {
    const content = this.buildContent(type, data);
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
    if (!this.emailTransporter) {
      // Fallback logging in absence of SMTP configuration
      console.warn('[notificationService] Email service not initialized. Falling back to console logging.');
      console.log('[email:fallback]', { to, subject, text: text?.slice(0, 200) });
      return { messageId: 'fallback-console' };
    }
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'info@gudgig.com',
      to,
      subject,
      html,
      text
    };

    const result = await this.emailTransporter.sendMail(mailOptions);
    return { messageId: result.messageId };
  }

  async verifySMTP() {
    await this.initPromise;
    if (!this.emailTransporter) {
      console.warn('[notificationService] SMTP not initialized. Skipping verification.');
      return false;
    }
    try {
      await this.emailTransporter.verify();
      console.log('[notificationService] SMTP verification succeeded');
      return true;
    } catch (err) {
      console.warn('[notificationService] SMTP verification failed:', err?.message || err);
      return false;
    }
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

    // Emit realtime if socket available
    if (this.io && typeof this.io.to === 'function') {
      this.io.to(`user:${userId}`).emit('notification:new', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
        createdAt: notification.createdAt
      });
    }

    return { notificationId: notification._id };
  }

  buildContent(type, data = {}) {
    const templateFn = this.templates[type];
    const template = templateFn ? templateFn(data) : {};
    const title = template.title || data.title || template.subject || 'Notification';
    const subject = template.subject || title;
    const body = template.body || data.message || template.text || 'You have a new notification.';
    const html = template.html || `<p>${body}</p>`;
    const text = template.text || body;
    return { ...template, title, subject, body, html, text };
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
    const subject = `Bid Received - ${data.jobTitle}`;
    const content = `
      <p>Your bid for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been received.</p>
      <p><strong>Bid ID:</strong> ${data.applicationId}</p>
      <p>You will be notified of any updates regarding your bid status.</p>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Bid Received',
        recipientName: data.applicantName,
        content
      }),
      text: `Bid Received\n\nDear ${data.applicantName},\n\nYour bid for ${data.jobTitle} at ${data.companyName} has been received.\nBid ID: ${data.applicationId}\n\nYou will be notified of any updates.`
    };
  }

  interviewScheduledTemplate(data) {
    const subject = `Interview Scheduled - ${data.jobTitle}`;
    const content = `
      <p>Congratulations! You have been selected for an interview.</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Position:</strong> ${data.jobTitle}</p>
        <p style="margin: 5px 0;"><strong>Company:</strong> ${data.companyName}</p>
        <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${data.interviewDate}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${data.location}</p>
        <p style="margin: 5px 0;"><strong>Interview Type:</strong> ${data.interviewType}</p>
        ${data.additionalInfo ? `<p style="margin: 5px 0;"><strong>Additional Info:</strong> ${data.additionalInfo}</p>` : ''}
      </div>
      <p>Please confirm your attendance by replying to this email or through your dashboard.</p>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Interview Scheduled',
        recipientName: data.applicantName || 'Freelancer',
        content
      }),
      text: `Interview Scheduled\n\nCongratulations! You have been selected for an interview.\n\nPosition: ${data.jobTitle}\nCompany: ${data.companyName}\nDate & Time: ${data.interviewDate}\nLocation: ${data.location}\nInterview Type: ${data.interviewType}\n\nPlease confirm your attendance.`
    };
  }

  applicationStatusUpdateTemplate(data) {
    const subject = `Application Status Update - ${data.jobTitle}`;
    const content = `
      <p>Your application status for <strong>${data.jobTitle}</strong> has been updated.</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0A66C2;">
        <p style="margin: 0;"><strong>New Status:</strong> ${data.status}</p>
        ${data.message ? `<p style="margin-top: 10px; color: #64748b; font-style: italic;">"${data.message}"</p>` : ''}
      </div>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Application Update',
        recipientName: data.applicantName,
        content,
        actionUrl: 'https://gudgig.com/dashboard/applications',
        actionText: 'View Application'
      }),
      text: `Application Status Update\n\nDear ${data.applicantName},\n\nYour application status for ${data.jobTitle} has been updated.\nNew Status: ${data.status}\n\nView details at: https://gudgig.com/dashboard/applications`
    };
  }

  // Subscription templates
  subscriptionActivatedTemplate(data) {
    const subject = 'Subscription Activated - Welcome to Premium';
    const content = `
      <p>Your subscription is now active. You have unlocked all premium features!</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Plan:</strong> ${data.planName}</p>
        <p style="margin: 5px 0;"><strong>Billing Cycle:</strong> ${data.billingCycle}</p>
        <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${data.currentPeriodEnd}</p>
      </div>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Subscription Active',
        recipientName: data.userName,
        content,
        actionUrl: 'https://gudgig.com/dashboard/subscription',
        actionText: 'Manage Subscription'
      }),
      text: `Subscription Activated\n\nPlan: ${data.planName}\nBilling Cycle: ${data.billingCycle}\nValid Until: ${data.currentPeriodEnd}`
    };
  }

  subscriptionPaymentFailedTemplate(data) {
    const subject = 'Payment Failed - Action Required';
    const content = `
      <p>We couldn't process your subscription payment. Please update your payment method to avoid service interruption.</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${data.reason || 'Unknown error'}</p>
      </div>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Payment Failed',
        recipientName: data.userName,
        content,
        actionUrl: 'https://gudgig.com/dashboard/billing',
        actionText: 'Update Payment Method'
      }),
      text: `Payment Failed\n\nReason: ${data.reason || 'Unknown'}\nPlease update your payment method at: https://gudgig.com/dashboard/billing`
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
    const subject = 'Gig Posted Successfully on GudGig';
    const content = `
      <p>Your gig posting has been successfully published and is now visible to freelancers.</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Gig Title:</strong> ${data.jobTitle}</p>
        <p style="margin: 5px 0;"><strong>Gig ID:</strong> ${data.jobId}</p>
        <p style="margin: 5px 0;"><strong>Posted on:</strong> ${data.postedDate}</p>
      </div>
      <p>Bids from qualified freelancers will appear in your employer dashboard shortly.</p>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Gig Published',
        recipientName: data.userName,
        content,
        actionUrl: `https://gudgig.com/dashboard/gigs/${data.jobId}`,
        actionText: 'View Dashboard'
      }),
      text: `Gig Posted Successfully\n\nYour gig "${data.jobTitle}" is live. Manage it here: https://gudgig.com/dashboard/gigs/${data.jobId}`
    };
  }

  newGigPostedTemplate(data) {
    return {
      subject: `New Gig: ${data.jobTitle}`,
      html: `
        <h2>New Gig Posted</h2>
        <p>A new gig matching your preferences has been posted: <strong>${data.jobTitle}</strong></p>
        <p>Category: ${data.category}</p>
        <p><a href="/gigs/${data.gigId}">View gig</a></p>
      `,
      text: `New gig posted: ${data.jobTitle} - category: ${data.category} - view: /gigs/${data.gigId}`
    };
  }

  gigUnlockedTemplate(data) {
    const subject = `Gig Unlocked: ${data.jobTitle}`;
    const content = `
      <p>You have successfully unlocked the contact details for <strong>${data.jobTitle}</strong>.</p>
      <p>You can now view the full gig details and contact the poster directly.</p>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Gig Unlocked',
        content,
        actionUrl: `https://gudgig.com/gigs/${data.gigId}`,
        actionText: 'View Gig Details'
      }),
      text: `You have successfully unlocked contact details for ${data.jobTitle}. View it here: https://gudgig.com/gigs/${data.gigId}`
    };
  }

  contactUnlockedTemplate(data) {
    const subject = `Contact Unlocked for Your Gig: ${data.jobTitle}`;
    const content = `
      <p>A user has recently unlocked the contact details for your gig <strong>${data.jobTitle}</strong>.</p>
      <p>Stay tuned for potential inquiries or bids!</p>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Interest in Your Gig',
        content,
        actionUrl: `https://gudgig.com/dashboard/gigs/${data.gigId}`,
        actionText: 'View Gig'
      }),
      text: `A user unlocked contact details for your gig: ${data.jobTitle}.`
    };
  }

  gigUpdatedTemplate(data) {
    const subject = `Gig Updated: ${data.jobTitle}`;
    const content = `
      <p>The gig <strong>${data.jobTitle}</strong> has been updated by the poster.</p>
      <p>Check the latest details to see if they affect your current bid or interest.</p>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Gig Update',
        content,
        actionUrl: `https://gudgig.com/gigs/${data.gigId}`,
        actionText: 'View Latest Details'
      }),
      text: `Gig updated: ${data.jobTitle}. Check changes: https://gudgig.com/gigs/${data.gigId}`
    };
  }

  gigHiddenTemplate(data) {
    return {
      subject: `Gig Hidden: ${data.jobTitle}`,
      html: `<h2>Your gig has been hidden</h2><p>${data.jobTitle} is now hidden.</p>`,
      text: `Your gig ${data.jobTitle} is now hidden.`
    };
  }

  gigUnhiddenTemplate(data) {
    return {
      subject: `Gig Visible: ${data.jobTitle}`,
      html: `<h2>Your gig is visible</h2><p>${data.jobTitle} is now visible to freelancers.</p>`,
      text: `Your gig ${data.jobTitle} is now visible.`
    };
  }

  passwordResetTemplate(data) {
    const subject = 'Password Reset Request';
    const content = `
      <p>You requested a password reset for your GudGig account. Click the button below to set a new password.</p>
      <p style="color: #64748b; font-size: 14px;">This link will expire in 60 minutes for security reasons.</p>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Password Reset',
        content,
        actionUrl: data.resetLink,
        actionText: 'Reset Password'
      }),
      text: `Password Reset Request\n\nClick here to reset your password: ${data.resetLink}\n\nIf you didn't request this, please ignore this email.`
    };
  }

  securityAlertTemplate(data) {
    const subject = 'Security Alert - GudGig Account Activity';
    const content = `
      <p>We detected unusual activity on your account. Please review the details below:</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Activity:</strong> ${data.activity}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${data.timestamp}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${data.location}</p>
      </div>
      <p>If this was you, no action is needed. If this wasn't you, please change your password immediately.</p>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Security Alert',
        content,
        actionUrl: 'https://gudgig.com/settings/security',
        actionText: 'Secure My Account'
      }),
      text: `Security Alert\n\nUnusual activity detected: ${data.activity}\nTime: ${data.timestamp}\nLocation: ${data.location}\n\nIf this wasn't you, secure your account at: https://gudgig.com/settings/security`
    };
  }

  otpTemplate(data) {
    const subject = `${data.otp} is your GudGig verification code`;
    const content = `
      <p>Use the following one-time password to continue with <strong>${data.purpose}</strong>.</p>
      <div class="otp-capsule">
        <span class="otp-code">${data.otp}</span>
      </div>
      <p style="text-align: center; color: #64748b; font-size: 14px;">
        Valid for 10 minutes. If you didn't request this, please ignore this email.
      </p>
    `;
    return {
      subject,
      html: wrapInBaseLayout({
        title: 'Security Verification',
        recipientName: data.recipientName,
        content
      }),
      text: `Your GudGig OTP code is: ${data.otp}. Purpose: ${data.purpose}. Expires in 10 minutes.`
    };
  }

  // Notification queuing and retry logic
  async queueNotification(userId, type, data, channels = ['email'], delay = 0) {
    // Persist queued notification to DB so a cron job can process reliably
    try {
      const scheduledFor = new Date(Date.now() + Math.max(0, delay));
      const doc = await NotificationQueue.create({
        userId,
        type,
        data,
        channels,
        scheduledFor,
        status: 'queued',
        retries: 0
      });
      return doc;
    } catch (err) {
      console.error('[notificationService] queueNotification persist error', err);
      // Fallback to in-memory processing if DB persist fails
      const notification = {
        userId,
        type,
        data,
        channels,
        scheduledFor: new Date(Date.now() + delay),
        status: 'queued',
        retries: 0
      };
      setTimeout(() => {
        this.processQueuedNotification(notification);
      }, delay);
      return notification;
    }
  }

  // Process a queued notification object or DB record
  async processQueuedNotification(notificationRecord) {
    // notificationRecord can be a plain object or a mongoose document from NotificationQueue
    const isDoc = notificationRecord && typeof notificationRecord.save === 'function';
    let id;
    try {
      if (isDoc) {
        id = notificationRecord._id;
        notificationRecord.status = 'processing';
        await notificationRecord.save();
      }

      await this.sendNotification(
        notificationRecord.userId || notificationRecord.user,
        notificationRecord.type,
        notificationRecord.data,
        notificationRecord.channels
      );

      if (isDoc) {
        notificationRecord.status = 'sent';
        notificationRecord.lastError = null;
        await notificationRecord.save();
      }
    } catch (error) {
      console.error('[notificationService] processQueuedNotification error', error?.message || error);
      if (isDoc) {
        notificationRecord.retries = (notificationRecord.retries || 0) + 1;
        notificationRecord.lastError = String(error?.message || error);
        if (notificationRecord.retries >= 3) {
          notificationRecord.status = 'failed';
        } else {
          notificationRecord.status = 'queued';
          // Exponential backoff: reschedule
          const backoffMs = Math.pow(2, notificationRecord.retries) * 1000 * 60; // minutes
          notificationRecord.scheduledFor = new Date(Date.now() + backoffMs);
        }
        await notificationRecord.save();
      } else {
        // plain object fallback retry
        notificationRecord.retries = (notificationRecord.retries || 0) + 1;
        if (notificationRecord.retries < 3) {
          setTimeout(() => this.processQueuedNotification(notificationRecord), Math.pow(2, notificationRecord.retries) * 1000);
        }
      }
    }
  }

  // Process pending queue (used by cron job)
  async processPendingQueue(limit = 50) {
    try {
      const now = new Date();
      const items = await NotificationQueue.find({ status: 'queued', scheduledFor: { $lte: now } }).sort({ scheduledFor: 1 }).limit(limit);
      for (const item of items) {
        try {
          await this.processQueuedNotification(item);
        } catch (err) {
          console.error('[notificationService] processing item failed', item._id, err?.message || err);
        }
      }
      return items.length;
    } catch (err) {
      console.error('[notificationService] processPendingQueue error', err?.message || err);
      throw err;
    }
  }

  // Notification analytics and delivery tracking
  async logNotification(userId, type, results) {
    // In production, store delivery analytics
    console.log(`Notification sent to user ${userId}: ${type}`, results);
  }

  // --- Enhancement helpers ---
  getPriorityForType(type) {
    const map = {
      securityAlert: 'critical',
      payment_confirmed: 'high',
      order_delivered: 'high',
      order_started: 'normal',
      order_placed: 'normal',
      applicationStatusUpdate: 'normal',
      jobApplicationReceived: 'low',
      jobPostedConfirmation: 'low',
      otp: 'critical'
    };
    return map[type] || 'normal';
  }

  resolveChannels(priority, requested) {
    const unique = new Set(requested || []);
    if (priority === 'critical') {
      ['inApp', 'push', 'email', 'sms'].forEach(c => unique.add(c));
    } else if (priority === 'high') {
      ['inApp', 'push', 'email'].forEach(c => unique.add(c));
    } else if (priority === 'normal') {
      ['inApp', 'email'].forEach(c => unique.add(c));
    } else {
      ['inApp'].forEach(c => unique.add(c));
    }
    return Array.from(unique);
  }

  isWithinQuietHours(preferences) {
    const quiet = preferences?.quietHours;
    if (!quiet || !quiet.enabled) return false;
    const now = new Date();
    const start = this.parseHHMM(quiet.start || '22:00');
    const end = this.parseHHMM(quiet.end || '07:00');
    const minutes = now.getHours() * 60 + now.getMinutes();
    const startMin = start.h * 60 + start.m;
    const endMin = end.h * 60 + end.m;
    if (startMin <= endMin) {
      return minutes >= startMin && minutes < endMin;
    } else {
      // crosses midnight
      return minutes >= startMin || minutes < endMin;
    }
  }

  msUntilQuietHoursEnd(preferences) {
    const end = this.parseHHMM(preferences?.quietHours?.end || '07:00');
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(end.h, end.m, 0, 0);
    if (endDate <= now) endDate.setDate(endDate.getDate() + 1);
    return Math.max(0, endDate.getTime() - now.getTime());
  }

  parseHHMM(s) { const [h, m] = String(s || '00:00').split(':').map(x => parseInt(x, 10) || 0); return { h, m }; }

  async isDuplicateRecently(userId, type, data, windowMs) {
    try {
      const since = new Date(Date.now() - windowMs);
      const keyFields = { type, 'data.key': data?.key || undefined };
      const query = { user: userId, type, createdAt: { $gte: since } };
      // Basic dedupe: same type and same data.message/title recently
      if (data && (data.message || data.title)) {
        query['$or'] = [
          { 'data.message': data.message },
          { 'data.title': data.title }
        ];
      }
      const recent = await Notification.findOne(query).select('_id').lean();
      return !!recent;
    } catch {
      return false;
    }
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