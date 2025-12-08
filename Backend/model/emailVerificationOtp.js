import mongoose from 'mongoose';

const emailVerificationOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - MongoDB will auto-delete expired documents
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
emailVerificationOtpSchema.index({ email: 1, createdAt: -1 });

// Method to check if OTP is valid
emailVerificationOtpSchema.methods.isValid = function() {
  return !this.isUsed && this.expiresAt > new Date();
};

// Static method to check rate limiting (max 6 OTP requests per hour)
emailVerificationOtpSchema.statics.checkRateLimit = async function(email) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentOtps = await this.countDocuments({
    email,
    createdAt: { $gte: oneHourAgo }
  });
  
  return recentOtps < 6;
};

export default mongoose.model('EmailVerificationOtp', emailVerificationOtpSchema);
