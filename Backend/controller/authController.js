import User from '../model/user.js';
import jwt from 'jsonwebtoken';
import Evaluation from "../model/data.js"


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
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
  
      // Create user
      const user = await User.create({
        email,
        password,
        role
      });
  
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
    console.log("logout");
    
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