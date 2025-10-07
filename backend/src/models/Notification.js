import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: false },
  message: { type: String, required: false },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);



