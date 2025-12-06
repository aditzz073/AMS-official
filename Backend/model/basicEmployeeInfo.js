import mongoose from 'mongoose';

const basicEmployeeInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true, // Primary identifier index
    validate: {
      validator: function(v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  employeeCode: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
    index: true, // Secondary index for foreign key lookups
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  college: {
    type: String,
    trim: true
  },
  campus: {
    type: String,
    trim: true
  },
  joiningDate: {
    type: Date
  },
  periodOfAssessment: {
    type: Date
  },
  externalEvaluatorName: {
    type: String,
    trim: true
  },
  principalName: {
    type: String,
    trim: true
  },
  HODName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
basicEmployeeInfoSchema.index({ email: 1, employeeCode: 1 });
basicEmployeeInfoSchema.index({ department: 1, college: 1 });

// Helper method to format date as YYYY-MM for frontend
basicEmployeeInfoSchema.methods.formatDateYYYYMM = function(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Method to get full employee info with formatted dates
basicEmployeeInfoSchema.methods.getFullInfo = function() {
  return {
    email: this.email,
    employeeCode: this.employeeCode,
    name: this.name,
    designation: this.designation,
    department: this.department,
    college: this.college,
    campus: this.campus,
    joiningDate: this.joiningDate,
    periodOfAssessment: this.periodOfAssessment,
    externalEvaluatorName: this.externalEvaluatorName,
    principalName: this.principalName,
    HODName: this.HODName
  };
};

// Static method to find by identifier (email or employeeCode)
basicEmployeeInfoSchema.statics.findByIdentifier = async function(identifier) {
  // Check if identifier is email
  if (identifier.includes('@')) {
    return await this.findOne({ email: identifier.toLowerCase() });
  }
  // Otherwise treat as employeeCode
  return await this.findOne({ employeeCode: identifier });
};

export default mongoose.model('BasicEmployeeInfo', basicEmployeeInfoSchema);
