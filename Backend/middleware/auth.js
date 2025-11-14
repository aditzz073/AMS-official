import jwt from 'jsonwebtoken';
import User from '../model/user.js';
import LoginLog from '../model/loginLog.js';
import { log } from 'console';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }    
    if (!token || token === 'none') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check token expiration
      const expirationTime = new Date(decoded.exp * 1000);
      if (expirationTime <= new Date()) {
        // Close any open sessions for this user
        await LoginLog.updateMany(
          { user: decoded.id, timeOut: null },
          { 
            timeOut: new Date(),
            sessionDuration: Date.now() - new Date().getTime()
          }
        );
        
        // Clear the expired cookie
        res.cookie('token', 'none', {
          expires: new Date(Date.now()),
          httpOnly: true,
          sameSite: 'strict'
        });
        
        return res.status(401).json({
          success: false,
          message: 'Token expired, please login again'
        });
      }

      // Get user from token
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      // Clear invalid token
      res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: 'strict'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user is admin
export const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};