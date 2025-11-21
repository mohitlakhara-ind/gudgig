import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  role: { type: String, trim: true },
  company: { type: String, trim: true },
  content: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  approved: { type: Boolean, default: false },
  metadata: { type: Object, default: {} }
}, {
  timestamps: true
});

export default mongoose.model('Testimonial', testimonialSchema);
