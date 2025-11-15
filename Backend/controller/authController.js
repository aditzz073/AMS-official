import User from '../model/user.js';
import jwt from 'jsonwebtoken';
import Evaluation from "../model/data.js"
import LoginLog from '../model/loginLog.js';
import EmailVerificationOtp from '../model/emailVerificationOtp.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { validateEmail } from '../utils/emailValidator.js';


// Constants for expiration (6 hours)
const EXPIRATION_HOURS = 6 ; //for 10sec= 10/3600
const EXPIRATION_MS = EXPIRATION_HOURS * 60 * 60 * 1000; // 6 hours in milliseconds

// Generate JWT Token with 6 hour expiration
const generateToken = (id,role) => {
  return jwt.sign({ id,role }, process.env.JWT_SECRET, {
    expiresIn: `${EXPIRATION_HOURS}h` // 6 hours
  });
};

// Set token cookie with 6 hour expiration
const sendTokenResponse =async (user, statusCode, res) => {
  const token = generateToken(user._id , user.role);

  const options = {
    expires: new Date(Date.now() + EXPIRATION_MS),
    httpOnly: true,
    sameSite: 'strict'
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  
  

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      expiresIn: EXPIRATION_MS,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
    });
};
export const signup = async (req, res) => {
    try {
      const { email, password, role } = req.body;
  
      // Validate required fields
      if (!email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and role are required'
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
          message: 'Email already registered'
        });
      }

      // Verify that OTP was validated for this email
      const verifiedOtp = await EmailVerificationOtp.findOne({
        email,
        isUsed: true,
        expiresAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Within last 15 minutes
      }).sort({ createdAt: -1 });

      if (!verifiedOtp) {
        return res.status(403).json({
          success: false,
          message: 'Email verification required. Please verify your email first.'
        });
      }
  
      // Create user with verified email
      const user = await User.create({
        email,
        password,
        role,
        emailVerified: true
      });

      // Send welcome email (non-blocking)
      sendWelcomeEmail(email, role).catch(err => 
        console.error('Failed to send welcome email:', err)
      );
  
      sendTokenResponse(user, 201, res);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Try to signup'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Close any previous open sessions for this user
    await LoginLog.updateMany(
      { user: user._id, timeOut: null },
      { 
        timeOut: new Date(),
        sessionDuration: Date.now() - new Date().getTime()
      }
    );

    // Create new login log entry
    const ipAddress = req.headers['x-forwarded-for'] || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress || 
                      req.ip;
    
    const userAgent = req.headers['user-agent'];

    await LoginLog.create({
      user: user._id,
      email: user.email,
      timeIn: new Date(),
      ipAddress,
      userAgent
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout user - Immediate expiration
// @route   GET /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    console.log("logout");
    
    // Update the latest open login log for this user
    if (req.user && req.user._id) {
      const openLog = await LoginLog.findOne({
        user: req.user._id,
        timeOut: null
      }).sort({ timeIn: -1 });

      if (openLog) {
        await openLog.closeSession();
      }
    }

    // Set cookie to expire immediately
    res.cookie('token', 'none', {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: 'strict'
    });

    // Clear any authorization header
    res.setHeader('Authorization', '');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Still logout the user even if logging fails
    res.cookie('token', 'none', {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};

// Optional: Refresh token endpoint if needed
export const refreshToken = async (req, res) => {
  try {
    const user = req.user; // From auth middleware
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};