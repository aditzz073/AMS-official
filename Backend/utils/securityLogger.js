// Security utility functions for logging and validation

/**
 * Safe logger that masks sensitive information
 * Only logs in development, suppresses in production
 */
export const logger = {
  info: (message, data = null) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, data ? sanitizeLogData(data) : '');
    }
  },
  
  error: (message, error = null) => {
    // Always log errors, but sanitize sensitive data
    console.error(`[ERROR] ${message}`, error ? sanitizeError(error) : '');
  },
  
  warn: (message, data = null) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[WARN] ${message}`, data ? sanitizeLogData(data) : '');
    }
  },
  
  success: (message, identifier = null) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SUCCESS] ${message}${identifier ? ` - ID: ${identifier}` : ''}`);
    }
  }
};

/**
 * Sanitize log data to remove sensitive information
 */
const sanitizeLogData = (data) => {
  if (!data) return data;
  
  const sensitive = ['password', 'token', 'otp', 'secret', 'jwt', 'cookie'];
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (sensitive.some(term => key.toLowerCase().includes(term))) {
      sanitized[key] = '***REDACTED***';
    }
  }
  
  return sanitized;
};

/**
 * Sanitize error objects before logging
 */
const sanitizeError = (error) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, only log error message and code, not stack trace
    return {
      message: error.message,
      code: error.code,
      name: error.name
    };
  }
  return error;
};

/**
 * Validate JWT_SECRET strength
 */
export const validateJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  if (secret.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET is too short. Use at least 32 characters for production.');
  }
  
  // Check if it's a weak/common secret
  const weakSecrets = ['secret', 'password', '123456', 'test', 'admin', 'default'];
  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
    throw new Error('JWT_SECRET is too weak. Use a strong, random secret in production.');
  }
  
  return true;
};

/**
 * Generate a strong random JWT secret (for setup reference)
 */
export const generateStrongSecret = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Mask email for logging (shows first 2 chars and domain)
 */
export const maskEmail = (email) => {
  if (!email) return 'unknown';
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
};

/**
 * Mask sensitive IDs for logging
 */
export const maskId = (id) => {
  if (!id) return 'unknown';
  const str = id.toString();
  return str.length > 8 ? `${str.substring(0, 4)}***${str.substring(str.length - 4)}` : '***';
};
