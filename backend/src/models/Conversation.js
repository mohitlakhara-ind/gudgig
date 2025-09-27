import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  attachments: [{ url: String, publicId: String, name: String, size: Number }],
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  lastMessageAt: { type: Date, default: Date.now, index: true },
  unreadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema],
  archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  metadata: { type: Object, default: {} }
}, { timestamps: true });

conversationSchema.index({ participants: 1 });

export default mongoose.model('Conversation', conversationSchema);


