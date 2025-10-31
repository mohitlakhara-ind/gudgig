import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quotation: { type: String, trim: true, maxlength: 2000 },
  proposal: { type: String, trim: true, maxlength: 5000 },
  attachments: { type: [String], default: [] },
  // Contact details collected during gig creation and bid submission
  contactDetails: {
    bidderContact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      name: { type: String, required: true }
    },
    posterContact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      name: { type: String, required: true },
      alternateContact: { type: String, default: '' }
    }
  },
  bidFeePaid: { type: Number, required: true, min: 0 },
  paymentStatus: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
  // Selection workflow (by employer/admin)
  selectionStatus: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending', index: true },
  selectedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

bidSchema.index({ gigId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Bid', bidSchema);


