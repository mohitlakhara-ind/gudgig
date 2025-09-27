import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Basic', 'Standard', 'Premium'],
    required: true
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 5
  },
  deliveryTimeDays: {
    type: Number,
    required: true,
    min: 1
  },
  revisions: {
    type: Number,
    min: 0,
    default: 1
  },
  features: [{
    type: String,
    trim: true
  }]
}, { _id: false });

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const requirementSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  type: { type: String, enum: ['text', 'attachment', 'multiple_choice'], default: 'text' },
  required: { type: Boolean, default: true },
  options: [{ type: String }]
}, { _id: false });

const galleryImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String },
  caption: { type: String }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  subcategory: {
    type: String,
    default: null
  },
  tags: [{ type: String, index: true }],
  packages: {
    type: [packageSchema],
    validate: v => Array.isArray(v) && v.length > 0
  },
  requirements: [requirementSchema],
  faq: [faqSchema],
  gallery: [galleryImageSchema],
  startingPrice: {
    type: Number,
    required: true,
    min: 5
  },
  averageDeliveryDays: {
    type: Number,
    min: 1,
    default: 3
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'denied', 'deleted'],
    default: 'draft',
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  analytics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  searchText: {
    type: String,
    index: 'text'
  }
}, {
  timestamps: true
});

serviceSchema.index({ title: 'text', description: 'text', tags: 'text', searchText: 'text' });

export default mongoose.model('Service', serviceSchema);


