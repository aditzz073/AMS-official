import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  timeIn: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  timeOut: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  sessionDuration: {
    type: Number, // Duration in milliseconds
    default: null
  }
}, {
  timestamps: true
});

// Calculate session duration before saving
loginLogSchema.pre('save', function(next) {
  if (this.timeOut && this.timeIn) {
    this.sessionDuration = this.timeOut - this.timeIn;
  }
  next();
});

// Method to close the session
loginLogSchema.methods.closeSession = function() {
  this.timeOut = new Date();
  this.sessionDuration = this.timeOut - this.timeIn;
  return this.save();
};

export default mongoose.model('LoginLog', loginLogSchema);
