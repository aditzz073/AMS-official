import User from '../model/user.js';
import BasicEmployeeInfo from '../model/basicEmployeeInfo.js';
import jwt from 'jsonwebtoken';
import LoginLog from '../model/loginLog.js';
import EmailVerificationOtp from '../model/emailVerificationOtp.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { validateEmail } from '../utils/emailValidator.js';
import { logger, maskEmail } from '../utils/securityLogger.js';

// Constants for expiration - shorter for admin roles
const EXPIRATION_HOURS = parseInt(process.env.TOKEN_EXPIRY_HOURS) || 6;
const ADMIN_EXPIRATION_HOURS = parseInt(process.env.ADMIN_TOKEN_EXPIRY_HOURS) || 2;
const EXPIRATION_MS = EXPIRATION_HOURS * 60 * 60 * 1000;
const ADMIN_EXPIRATION_MS = ADMIN_EXPIRATION_HOURS * 60 * 60 * 1000;

// Generate JWT Token with role-based expiration (shorter for admin)
const generateToken = (id, role, email, employeeCode) => {
  const isAdmin = role === 'admin';
  const expiryHours = isAdmin ? ADMIN_EXPIRATION_HOURS : EXPIRATION_HOURS;
  
  return jwt.sign({ 
    id, 
    role, 
    email,
    employeeCode 
  }, process.env.JWT_SECRET, {
    expiresIn: `${expiryHours}h`
  });
};

// Set token cookie with role-based expiration
const sendTokenResponse = async (user, statusCode, res) => {
  const token = generateToken(user._id, user.role, user.email, user.employeeCode);
  const isAdmin = user.role === 'admin';
  const expiryMs = isAdmin ? ADMIN_EXPIRATION_MS : EXPIRATION_MS;

  const options = {
    expires: new Date(Date.now() + expiryMs),
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production' // Only send over HTTPS in production
  };

  logger.success('Token generated', `Role: ${user.role}, Expiry: ${isAdmin ? ADMIN_EXPIRATION_HOURS : EXPIRATION_HOURS}h`);

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      expiresIn: expiryMs,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeCode: user.employeeCode
      },
    });
};
export const signup = async (req, res) => {
    try {
      const { email, password, role, employeeCode } = req.body;
  
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

      // If employeeCode is provided, validate it's unique
      if (employeeCode) {
        const existingEmployee = await BasicEmployeeInfo.findOne({ employeeCode });
        if (existingEmployee && existingEmployee.email !== email) {
          return res.status(400).json({
            success: false,
            message: 'Employee code already in use'
          });
        }
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
  
      // Create or update BasicEmployeeInfo
      const basicInfo = await BasicEmployeeInfo.findOneAndUpdate(
        { email },
        { 
          email,
          employeeCode: employeeCode || undefined
        },
        { 
          upsert: true, 
          new: true, 
          setDefaultsOnInsert: true 
        }
      );

      // Create user with verified email
      const user = await User.create({
        email,
        password,
        role,
        emailVerified: true,
        employeeCode: employeeCode || undefined
      });

      // Send welcome email (non-blocking)
      sendWelcomeEmail(email, role).catch(err => 
        logger.error('Failed to send welcome email', { code: err.code })
      );
  
      logger.success('User signup successful', maskEmail(email));
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
      logger.warn('Failed login attempt', maskEmail(email));
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

    logger.success('User login successful', `${maskEmail(email)} - Role: ${user.role}`);
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

    logger.success('User logout successful', req.user ? maskEmail(req.user.email) : 'unknown');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error', error);
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