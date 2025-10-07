import { Router } from 'express';
import logger from '../utils/logger.js';

const router = Router();

// In-memory store as a minimal implementation
const tickets = [];

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



