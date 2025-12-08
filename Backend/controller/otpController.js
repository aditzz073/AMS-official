import EmailVerificationOtp from '../model/emailVerificationOtp.js';
import User from '../model/user.js';
import { generateOTP, sendOTPEmail } from '../utils/emailService.js';
import { validateEmail, getInvalidDomainMessage } from '../utils/emailValidator.js';

// @desc    Request OTP for email verification
// @route   POST /api/auth/request-otp
// @access  Public
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format and domain
    const emailValidation = validateEmail(email);
    if (!emailValidation.success) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

    // Check if user already exists with verified email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // Check rate limiting (max 6 OTPs per hour)
    const canSendOTP = await EmailVerificationOtp.checkRateLimit(email);
    if (!canSendOTP) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after an hour.'
      });
    }

    // Invalidate any existing unused OTPs for this email
    await EmailVerificationOtp.updateMany(
      { email, isUsed: false },
      { isUsed: true }
    );

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await EmailVerificationOtp.create({
      email,
      otp,
      expiresAt
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP. Please try again.'
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }

    // Find the most recent unused OTP for this email
    const otpRecord = await EmailVerificationOtp.findOne({
      email,
      otp,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
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

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      email
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format and domain
    const emailValidation = validateEmail(email);
    if (!emailValidation.success) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // Check rate limiting
    const canSendOTP = await EmailVerificationOtp.checkRateLimit(email);
    if (!canSendOTP) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after an hour.'
      });
    }

    // Invalidate previous OTPs
    await EmailVerificationOtp.updateMany(
      { email, isUsed: false },
      { isUsed: true }
    );

    // Generate and send new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailVerificationOtp.create({
      email,
      otp,
      expiresAt
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully',
      expiresIn: 600
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
};
