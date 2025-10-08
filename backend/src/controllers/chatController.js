import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import chatNotificationService from '../services/chatNotificationService.js';

// GET /api/conversations
export const getConversations = async (req, res, next) => {
  try {
    const { userId } = req.query || {};

    let conversations;
    // Admins: if userId provided, filter by that user; otherwise return recent conversations across the system
    if (req.user?.role === 'admin') {
      const query = userId ? { participants: userId } : {};
      conversations = await Conversation.find(query)
        .sort({ lastMessageAt: -1 })
        .limit(100)
        .populate('participants', 'name role');
    } else {
      // Regular users: only their conversations
      conversations = await Conversation.find({ participants: req.user._id })
        .sort({ lastMessageAt: -1 })
        .populate('participants', 'name role');
    }

    res.status(200).json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    next(error);
  }
};

// POST /api/conversations
export const startConversation = async (req, res, next) => {
  try {
    const { participantId, participantRole } = req.body || {};

    let targetUserId = participantId;
    // Optional: allow starting by role, pick first matching admin
    if (!targetUserId && participantRole === 'admin') {
      const admin = await User.findOne({ role: 'admin' }).select('_id');
      if (!admin) return res.status(404).json({ success: false, message: 'No admin available' });
      targetUserId = admin._id;
    }

    if (!targetUserId) return res.status(400).json({ success: false, message: 'participantId or participantRole is required' });

    // Policy: freelancers can only message admins
    if (req.user?.role === 'freelancer') {
      const target = await User.findById(targetUserId).select('role');
      if (!target) return res.status(404).json({ success: false, message: 'Target user not found' });
      if (target.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Freelancers can only start chats with admin' });
      }
    }

    // Reuse existing 1:1 conversation strictly between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, targetUserId] },
      $expr: { $eq: [ { $size: "$participants" }, 2 ] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, targetUserId],
        lastMessageAt: new Date(),
        unreadBy: [targetUserId]
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
    // Allow admins to view any conversation
    if (!isParticipant && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
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
    // Allow admins to send without altering participants
    if (!isParticipant && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Policy: freelancers can only send in conversations that include an admin
    if (req.user?.role === 'freelancer') {
      const adminCount = await User.countDocuments({ _id: { $in: conversation.participants }, role: 'admin' });
      if (adminCount === 0) {
        return res.status(403).json({ success: false, message: 'Freelancers can only message admin' });
      }
    }

    const message = { sender: req.user._id, content, attachments, createdAt: new Date() };
    conversation.messages.push(message);
    conversation.lastMessageAt = new Date();
    conversation.unreadBy = conversation.participants.filter(p => p.toString() !== req.user.id);
    await conversation.save();

    const io = req.app.get('io');
    if (io) {
      const payload = { conversationId: conversation._id.toString(), message };
      conversation.participants.forEach(p => {
        io.to(`user:${p.toString()}`).emit('message:new', payload);
      });
      // Also emit to a conversation-specific room for viewers (e.g., admins)
      io.to(`conversation:${conversation._id.toString()}`).emit('message:new', payload);
    }

    // Create chat notifications for recipients (excluding sender)
    try {
      const messageId = message._id ? message._id.toString() : Date.now().toString();
      const metadata = {
        messageType: attachments && attachments.length > 0 ? 'attachment' : 'text',
        attachmentCount: attachments ? attachments.length : 0
      };
      
      await chatNotificationService.createChatNotification(
        conversation._id.toString(),
        req.user._id.toString(),
        messageId,
        content,
        metadata
      );
    } catch (notificationError) {
      // Log error but don't fail the message sending
      console.error('Error creating chat notification:', notificationError);
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
    // Allow admin to mark as read (best-effort)
    if (!isParticipant && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    conversation.unreadBy = conversation.unreadBy.filter(id => id.toString() !== req.user.id);
    await conversation.save();

    res.status(200).json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    next(error);
  }
};


