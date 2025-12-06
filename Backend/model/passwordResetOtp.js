import mongoose from 'mongoose';

const passwordResetOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '10m' } // Auto-delete expired documents after 10 minutes
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

// Add index for faster queries
passwordResetOtpSchema.index({ email: 1, createdAt: -1 });

// Method to check if OTP is still valid
passwordResetOtpSchema.methods.isValid = function() {
  return this.expiresAt > new Date() && !this.isUsed;
};

// Static method to check rate limiting (max 3 OTPs per hour)
passwordResetOtpSchema.statics.checkRateLimit = async function(email) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentOtps = await this.countDocuments({
    email,
    createdAt: { $gte: oneHourAgo }
  });
  return recentOtps < 3;
};

// Static method to invalidate all previous OTPs for an email
passwordResetOtpSchema.statics.invalidatePreviousOtps = async function(email) {
  await this.updateMany(
    { email, isUsed: false },
    { isUsed: true }
  );
};

const PasswordResetOtp = mongoose.model('PasswordResetOtp', passwordResetOtpSchema);

export default PasswordResetOtp;
