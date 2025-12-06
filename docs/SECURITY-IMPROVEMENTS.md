# Security Improvements Implementation Guide

## Overview
This document outlines the security enhancements implemented in the AMS (Appraisal Management System) backend to ensure production-ready deployment.

---

## 1. JWT Security Hardening

### Changes Implemented

#### JWT Secret Validation
- **File**: `Backend/server.js`
- **Feature**: Validates JWT_SECRET on server startup
- **Rules**:
  - Minimum 32 characters required
  - Rejects weak/common secrets (e.g., "secret", "password", "123456")
  - **Production Mode**: Server won't start with weak secrets
  - **Development Mode**: Shows warning but continues

#### JWT Secret Generation
Use this command to generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Role-Based Token Expiry
- **Regular Users** (faculty, hod, external, principal): 6 hours (configurable via `TOKEN_EXPIRY_HOURS`)
- **Admin Users**: 2 hours (configurable via `ADMIN_TOKEN_EXPIRY_HOURS`)
- **Rationale**: Admins have elevated privileges and require shorter session times

### Environment Variables
```env
# Strong JWT secret (minimum 32 characters)
JWT_SECRET=your-generated-64-char-hex-string

# Token expiry configuration
TOKEN_EXPIRY_HOURS=6
ADMIN_TOKEN_EXPIRY_HOURS=2
```

---

## 2. Rate Limiting

### Implementation
- **File**: `Backend/middleware/rateLimiter.js`
- **Package**: `express-rate-limit@^7.1.5`

### Rate Limit Policies

| Route Type | Window | Max Requests | Purpose |
|-----------|---------|--------------|---------|
| **Login** | 15 min | 5 attempts | Prevent brute force attacks |
| **OTP Request** | 1 hour | 3 requests | Prevent OTP spam |
| **Password Reset** | 1 hour | 3 requests | Prevent password reset abuse |
| **Admin Routes** | 15 min | 50 requests | Stricter limits for sensitive data |
| **General API** | 15 min | 100 requests | Standard protection |

### Applied Routes

#### Authentication Routes
```javascript
POST /app/login                    → loginLimiter
POST /app/signup                   → apiLimiter
POST /app/auth/request-otp         → otpLimiter
POST /app/auth/resend-otp          → otpLimiter
POST /app/auth/forgot-password     → passwordResetLimiter
POST /app/auth/reset-password      → passwordResetLimiter
POST /app/auth/resend-reset-otp    → passwordResetLimiter
```

#### Admin Routes
```javascript
GET  /app/admin/login-logs         → protect + adminOnly + adminLimiter
GET  /app/admin/login-stats        → protect + adminOnly + adminLimiter
POST /app/admin/close-stale-sessions → protect + adminOnly + adminLimiter
```

### Installation
```bash
cd Backend
npm install express-rate-limit
```

---

## 3. Secure Logging

### Implementation
- **File**: `Backend/utils/securityLogger.js`
- **Purpose**: Prevent sensitive data leakage in logs

### Features

#### Environment-Aware Logging
- **Development**: Verbose logging with sanitized data
- **Production**: Minimal logging, errors only with stack trace removed

#### Sensitive Data Masking
Automatically redacts:
- Passwords
- Tokens (JWT, OTP)
- Secrets
- Cookies
- Full email addresses (shows only `ab***@domain.com`)

### Usage Examples

```javascript
import { logger, maskEmail, maskId } from '../utils/securityLogger.js';

// Success logging
logger.success('User login successful', `${maskEmail(email)} - Role: ${role}`);

// Error logging
logger.error('Database connection failed', error);

// Info logging (development only)
logger.info('Processing request', { userId: maskId(userId) });

// Warning logging (development only)
logger.warn('Failed login attempt', maskEmail(email));
```

### Applied in Controllers
- ✅ `authController.js` - Login, signup, logout
- ✅ `emailService.js` - Email sending operations
- ⚠️ **TODO**: Update remaining controllers to use secure logger

---

## 4. Route Protection Audit

### Current Protection Status

#### ✅ Fully Protected Routes
All evaluation, remarks, and user data routes require authentication:

```javascript
// Employee Data (protected)
POST /app/addData              → protect + uploadFields
GET  /app/getData/:id          → protect
GET  /app/getEmpCode           → protect

// Basic Info (protected)
GET  /app/basicInfo            → protect
PUT  /app/basicInfo            → protect
GET  /app/basicInfo/:identifier → protect

// Remarks (protected)
GET  /app/remarks/:employeeCode      → protect
PUT  /app/remarks/:employeeCode      → protect
PUT  /app/remarks/:employeeCode/bulk → protect

// Admin Routes (protected + role check)
GET  /app/admin/*              → protect + adminOnly
```

#### ✅ Public Routes (By Design)
Authentication routes must remain public:
- `/app/login`
- `/app/signup`
- `/app/auth/request-otp`
- `/app/auth/verify-otp`
- `/app/auth/forgot-password`
- `/app/auth/reset-password`

### Middleware Stack
Each protected route uses:
1. **Rate Limiter** (if applicable)
2. **Protect Middleware** (JWT verification)
3. **Role Check** (adminOnly, etc. if needed)
4. **Controller Logic**

---

## 5. Production Deployment Checklist

### Pre-Deployment Steps

#### 1. Environment Configuration
- [ ] Generate strong JWT_SECRET (64+ chars)
- [ ] Set `NODE_ENV=production`
- [ ] Update `MONGO_URI` to production database
- [ ] Update `CLIENT_URL` to production frontend URL
- [ ] Configure production SMTP service (SendGrid, AWS SES, etc.)
- [ ] Set appropriate token expiry times

#### 2. Security Verification
- [ ] Run server startup to validate JWT_SECRET
- [ ] Test rate limiting on all protected routes
- [ ] Verify secure cookies (HTTPS + httpOnly + sameSite)
- [ ] Check CORS configuration for production domain
- [ ] Audit logs for sensitive data leakage

#### 3. Dependency Installation
```bash
cd Backend
npm install
```

#### 4. Testing
```bash
# Test authentication flow
npm test

# Manual testing checklist
# - Login rate limiting (5 attempts in 15 min)
# - OTP rate limiting (3 requests per hour)
# - Admin token expiry (2 hours)
# - Regular token expiry (6 hours)
# - Secure cookie transmission over HTTPS
```

---

## 6. Remaining Improvements (Optional)

### High Priority
1. **Helmet.js**: Add security headers
   ```bash
   npm install helmet
   ```
   ```javascript
   import helmet from 'helmet';
   app.use(helmet());
   ```

2. **MongoDB Injection Protection**: Already handled by Mongoose, but audit queries

3. **Input Sanitization**: Consider adding `express-mongo-sanitize`
   ```bash
   npm install express-mongo-sanitize
   ```

### Medium Priority
1. **CSRF Protection**: Add `csurf` for form submissions
2. **Request Size Limits**: Already configured (50mb), verify if appropriate
3. **API Documentation**: Add Swagger/OpenAPI docs
4. **Monitoring**: Add APM tool (New Relic, Datadog, etc.)

### Low Priority
1. **Session Management**: Consider Redis for session store
2. **Two-Factor Authentication**: Add 2FA for admin users
3. **Audit Trail**: Log all admin actions to separate collection
4. **IP Whitelisting**: Restrict admin panel to specific IPs

---

## 7. Security Incident Response

### If JWT_SECRET is Compromised
1. Generate new JWT_SECRET immediately
2. Force logout all users (invalidate all tokens)
3. Monitor login logs for suspicious activity
4. Notify users to change passwords

### If OTP Spam Detected
1. Review rate limiting configuration
2. Check for IP-based attacks
3. Consider adding CAPTCHA to OTP request
4. Block suspicious IPs at firewall level

### If Brute Force Attack Detected
1. Review login logs (`/app/admin/login-logs`)
2. Identify attacking IPs
3. Temporarily block IPs using firewall/nginx
4. Consider reducing login rate limit

---

## 8. Files Modified/Created

### Created Files
- ✅ `Backend/middleware/rateLimiter.js` - Rate limiting configuration
- ✅ `Backend/utils/securityLogger.js` - Secure logging utilities
- ✅ `Backend/.env.production.example` - Production environment template
- ✅ `docs/SECURITY-IMPROVEMENTS.md` - This document

### Modified Files
- ✅ `Backend/server.js` - JWT validation on startup
- ✅ `Backend/routers/router.js` - Rate limiters applied
- ✅ `Backend/controller/authController.js` - Secure logging, role-based token expiry
- ✅ `Backend/utils/emailService.js` - Secure logging
- ✅ `Backend/.env` - Added token expiry configuration
- ✅ `Backend/package.json` - Added `express-rate-limit` dependency

---

## 9. Testing Commands

### Install Dependencies
```bash
cd /Users/aditya/Documents/mini_project_25/Backend
npm install
```

### Start Server
```bash
npm start
```

### Expected Console Output
```
✅ JWT_SECRET validation passed
✅ Connected to MongoDB
Server started in development mode on port 9000
```

### Test Rate Limiting
```bash
# Test login rate limit (should block after 5 attempts)
for i in {1..6}; do
  curl -X POST http://localhost:9000/app/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "\nAttempt $i"
done
```

---

## 10. Support & Maintenance

### Monitoring Production Logs
```bash
# Filter by log level
grep "\[ERROR\]" production.log
grep "\[SUCCESS\]" production.log

# Monitor rate limit hits
grep "Too many" production.log
```

### Update Rate Limits
Edit `Backend/middleware/rateLimiter.js` and restart server.

### Rotate JWT Secret
1. Update `.env` with new secret
2. Restart server
3. All users will need to re-login

---

**Status:** ✅ Security improvements implemented and ready for testing  
**Version:** 2.0  
**Last Updated:** December 6, 2025
