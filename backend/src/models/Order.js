import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date },
  status: { type: String, enum: ['pending', 'in_progress', 'delivered', 'approved', 'released', 'cancelled'], default: 'pending' },
  deliveryFiles: [{ url: String, publicId: String, name: String }],
  deliveredAt: { type: Date },
  approvedAt: { type: Date }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  attachments: [{ url: String, publicId: String, name: String, size: Number }],
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  provider: { type: String, enum: ['stripe', 'paypal', 'razorpay', 'other'], default: 'stripe' },
  intentId: { type: String },
  chargeId: { type: String },
  escrowHeld: { type: Boolean, default: false },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  fees: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'authorized', 'captured', 'refunded', 'failed'], default: 'pending' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
  package: {
    name: { type: String, enum: ['Basic', 'Standard', 'Premium'], required: true },
    price: { type: Number, required: true, min: 0 },
    deliveryTimeDays: { type: Number, required: true, min: 1 },
    revisions: { type: Number, default: 1 },
    features: [{ type: String }]
  },
  status: { type: String, enum: ['pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'], default: 'pending', index: true },
  milestones: [milestoneSchema],
  requirementsAnswers: [{ prompt: String, answer: String }],
  payment: paymentSchema,
  delivery: {
    message: { type: String, default: '' },
    files: [{ url: String, publicId: String, name: String, size: Number }],
    deliveredAt: { type: Date }
  },
  communicationThread: [messageSchema],
  timeline: [{
    event: { type: String },
    data: { type: Object },
    createdAt: { type: Date, default: Date.now }
  }],
  reviewGivenByBuyer: { type: Boolean, default: false },
  reviewGivenBySeller: { type: Boolean, default: false }
}, { timestamps: true });

orderSchema.index({ buyer: 1, seller: 1, status: 1 });

export default mongoose.model('Order', orderSchema);


