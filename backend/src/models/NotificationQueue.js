import mongoose from 'mongoose';

const notificationQueueSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  data: { type: Object, default: {} },
  channels: { type: [String], default: ['email'] },
  scheduledFor: { type: Date, default: Date.now },
  status: { type: String, enum: ['queued', 'processing', 'sent', 'failed'], default: 'queued' },
  retries: { type: Number, default: 0 },
  lastError: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('NotificationQueue', notificationQueueSchema);
