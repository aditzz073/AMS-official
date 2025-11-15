import PasswordResetOtp from '../model/passwordResetOtp.js';
import User from '../model/user.js';
import { generateOTP, sendPasswordResetOTP } from '../utils/emailService.js';

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Basic email format validation only (no domain restriction)
    const basicEmailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!basicEmailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if user exists with this email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'This email ID is not registered in the system.'
      });
    }

    // Check rate limiting (max 3 OTPs per hour)
    const canSendOTP = await PasswordResetOtp.checkRateLimit(email);
    if (!canSendOTP) {
      return res.status(429).json({
        success: false,
        message: 'Too many password reset requests. Please try again after an hour.'
      });
    }

    // Invalidate any existing unused OTPs for this email
    await PasswordResetOtp.invalidatePreviousOtps(email);

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await PasswordResetOtp.create({
      email: email.toLowerCase().trim(),
      otp,
      expiresAt
    });

    // Send OTP email
    await sendPasswordResetOTP(email, otp, user.role);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your registered email.',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send password reset OTP. Please try again.'
    });
  }
};

// @desc    Verify password reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Basic email format validation only
    const basicEmailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!basicEmailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the most recent unused OTP for this email
    const otpRecord = await PasswordResetOtp.findOne({
      email: email.toLowerCase().trim(),
      otp,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (!otpRecord.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Increment attempts
    otpRecord.attempts += 1;

    // Check max attempts (5 attempts allowed)
    if (otpRecord.attempts > 5) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      });
    }

    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      email: email.toLowerCase().trim()
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP one final time before password reset
    const otpRecord = await PasswordResetOtp.findOne({
      email: email.toLowerCase().trim(),
      otp,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (!otpRecord || !otpRecord.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // Update user password (will be hashed by the User model pre-save hook)
    user.password = newPassword;
    await user.save();

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Invalidate all other OTPs for this email
    await PasswordResetOtp.invalidatePreviousOtps(email);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password. Please try again.'
    });
  }
};

// @desc    Resend password reset OTP
// @route   POST /api/auth/resend-reset-otp
// @access  Public
export const resendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Basic email format validation only
    const basicEmailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!basicEmailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'This email ID is not registered in the system.'
      });
    }

    // Check rate limiting
    const canSendOTP = await PasswordResetOtp.checkRateLimit(email);
    if (!canSendOTP) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after an hour.'
      });
    }

    // Invalidate previous OTPs
    await PasswordResetOtp.invalidatePreviousOtps(email);

    // Generate and send new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordResetOtp.create({
      email: email.toLowerCase().trim(),
      otp,
      expiresAt
    });

    await sendPasswordResetOTP(email, otp, user.role);

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully',
      expiresIn: 600
    });
  } catch (error) {
    console.error('Resend reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
};
