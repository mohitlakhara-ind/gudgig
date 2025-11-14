import { Router } from 'express';
import logger from '../utils/logger.js';
import notificationService from '../services/notificationService.js';

const router = Router();

// In-memory store as a minimal implementation
const tickets = [];

// Public contact form endpoint (no authentication required)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    
    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, subject, and message are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email address' 
      });
    }

    // Create contact submission record
    const contactSubmission = {
      id: `contact_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      type: subject.toLowerCase().includes('post lead') || subject.toLowerCase().includes('lead') ? 'lead_request' : 'general',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    
    tickets.push(contactSubmission);
    logger.info('contact_form_submitted', { 
      id: contactSubmission.id, 
      email: contactSubmission.email,
      type: contactSubmission.type 
    });

    // Send email notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || 'support@gigsmint.com';
      const emailSubject = contactSubmission.type === 'lead_request' 
        ? `[Lead Request] ${subject}` 
        : `[Contact Form] ${subject}`;
      
      const emailBody = `
        New Contact Form Submission from Gigsmint.com
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Type: ${contactSubmission.type === 'lead_request' ? 'Lead Request' : 'General Inquiry'}
        
        Message:
        ${message}
        
        ---
        Submitted at: ${new Date().toLocaleString()}
        Submission ID: ${contactSubmission.id}
      `;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Type:</strong> ${contactSubmission.type === 'lead_request' ? 'Lead Request' : 'General Inquiry'}</p>
          </div>
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>Submitted at: ${new Date().toLocaleString()}</p>
            <p>Submission ID: ${contactSubmission.id}</p>
          </div>
        </div>
      `;

      await notificationService.sendEmail(adminEmail, emailSubject, emailHtml, emailBody);

      logger.info('contact_form_email_sent', { id: contactSubmission.id, to: adminEmail });
    } catch (emailError) {
      logger.error('contact_form_email_failed', { 
        error: emailError?.message, 
        id: contactSubmission.id 
      });
      // Don't fail the request if email fails, just log it
    }

    return res.status(201).json({ 
      success: true, 
      message: 'Thank you for contacting us! We will get back to you within 24 hours.',
      data: { id: contactSubmission.id }
    });
  } catch (e) {
    logger.error('contact_form_error', { error: e?.message });
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to submit contact form. Please try again later.' 
    });
  }
});

// Authenticated support ticket endpoint (existing)
router.post('/', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { subject, message, priority = 'medium' } = req.body || {};
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'subject and message are required' });
    }

    const ticket = {
      id: `tick_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      subject,
      message,
      priority,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    tickets.push(ticket);
    logger.info('support_ticket_created', { id: ticket.id, priority });

    return res.status(201).json({ success: true, data: ticket });
  } catch (e) {
    logger.error('support_ticket_error', { error: e?.message });
    return res.status(500).json({ success: false, message: 'Failed to create support ticket' });
  }
});

export default router;



