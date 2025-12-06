// Rate limiting middleware for authentication routes
// Configured for 200+ concurrent users
import rateLimit from 'express-rate-limit';

// Strict rate limiter for login attempts (prevent brute force)
// Allows failed attempts only - successful logins don't count
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 failed attempts per window (increased for 200 users)
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests from counting - only failed attempts count
  skipSuccessfulRequests: true
});

// General API rate limiter for all protected routes
// High limit to support 200 concurrent users with normal activity
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window (increased from 100 for 200 users)
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// OTP request limiter (per email address, not per IP)
// Allows multiple users from same network
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 OTP requests per hour per email (increased from 3)
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by email instead of IP to allow multiple users from same network
    return req.body.email || req.ip;
  }
});

// Password reset limiter (per email address)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 password reset attempts per hour per email (increased from 3)
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by email to allow multiple users from same network
    return req.body.email || req.ip;
  }
});

// Admin route limiter - higher limit for admin operations
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window for admin operations (increased from 50)
  message: {
    success: false,
    message: 'Too many admin requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
