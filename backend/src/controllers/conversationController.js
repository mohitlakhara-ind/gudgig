import Conversation from '../models/Conversation.js';
import Order from '../models/Order.js';

// GET /api/conversations
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'name avatar')
      .populate('order', 'status');
    res.status(200).json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    next(error);
  }
};

// POST /api/conversations
export const startConversation = async (req, res, next) => {
  try {
    const { participantId, orderId } = req.body;
    if (!participantId) return res.status(400).json({ success: false, message: 'participantId is required' });

    // If orderId provided, ensure user is part of the order
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      const isParticipant = [order.buyer.toString(), order.seller.toString()].includes(req.user.id);
      if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      order: orderId || null
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
        order: orderId || null,
        lastMessageAt: new Date(),
        unreadBy: [participantId]
      });
    }

    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

// GET /api/conversations/:id/messages
export const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const isParticipant = conversation.participants.some(p => p.toString() === req.user.id);
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });
    res.status(200).json({ success: true, data: conversation.messages || [] });
  } catch (error) {
    next(error);
  }
};

// POST /api/conversations/:id/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { content = '', attachments = [] } = req.body;
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const isParticipant = conversation.participants.some(p => p.toString() === req.user.id);
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    const message = { sender: req.user._id, content, attachments, createdAt: new Date() };
    conversation.messages.push(message);
    conversation.lastMessageAt = new Date();
    conversation.unreadBy = conversation.participants.filter(p => p.toString() !== req.user.id);
    await conversation.save();

    const io = req.app.get('io');
    if (io) {
      conversation.participants.forEach(p => {
        io.to(`user:${p.toString()}`).emit('message:new', { conversationId: conversation._id.toString(), message });
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// PUT /api/conversations/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const isParticipant = conversation.participants.some(p => p.toString() === req.user.id);
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    conversation.unreadBy = conversation.unreadBy.filter(id => id.toString() !== req.user.id);
    await conversation.save();

    res.status(200).json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    next(error);
  }
};


