import mongoose from 'mongoose';

const contactDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  countryCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: [3, 'Country code cannot be more than 3 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Additional contact info
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot be more than 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Ensure only one default contact per user
contactDetailsSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Indexes for performance
contactDetailsSchema.index({ userId: 1, isActive: 1 });
contactDetailsSchema.index({ userId: 1, isDefault: 1 });
contactDetailsSchema.index({ email: 1 });
contactDetailsSchema.index({ phone: 1 });

export default mongoose.model('ContactDetails', contactDetailsSchema);



