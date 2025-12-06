# 🔄 Rate Limiter Configuration Update

## Changes Made for 200 Concurrent Users

### Updated Limits (December 6, 2025)

| Rate Limiter | Previous | Updated | Window | Reason |
|--------------|----------|---------|--------|--------|
| **Login** | 5 attempts | 10 attempts | 15 min | Increased for 200 users (only failed attempts count) |
| **General API** | 100 requests | 500 requests | 15 min | Support high concurrent usage (200+ users) |
| **OTP Request** | 3 requests | 5 requests | 1 hour | Allow for retries with legitimate issues |
| **Password Reset** | 3 requests | 5 requests | 1 hour | Allow for retries with legitimate issues |
| **Admin Routes** | 50 requests | 200 requests | 15 min | Support admin managing 200 users |

---

## Key Design Decisions

### 1. Email-Based Rate Limiting
**Why:** Multiple users may access from the same IP (same office/campus network)
- OTP requests tracked per email
- Password reset tracked per email
- Prevents blocking legitimate users sharing same network

### 2. Login Limiter Strategy
**Important:** `skipSuccessfulRequests: true`
- Only failed login attempts count towards limit
- Successful logins don't consume rate limit
- Users can log in unlimited times if credentials are correct
- **10 failed attempts in 15 minutes** still provides strong brute force protection

### 3. General API Limiter: 500 requests/15min
**Calculation:**
- 200 concurrent users
- Each user: ~2-3 requests per minute during active form filling
- 200 users × 3 requests/min × 15 min = 9,000 total (system-wide)
- **500 per user** = plenty of headroom for legitimate activity
- Typical user workflow: login → navigate → fill forms → submit = ~50-100 requests

### 4. Admin Limiter: 200 requests/15min
**Rationale:**
- Admin may need to review multiple employee records
- Viewing login logs, statistics, managing users
- 200 requests supports checking ~30-40 employee records thoroughly

---

## Security Still Maintained

### ✅ Brute Force Protection
- 10 failed login attempts still blocks attacker
- Per-email OTP/password reset limits prevent spam
- Successful operations don't count against limits

### ✅ DDoS Protection
- 500 API requests/15min per user is generous but not unlimited
- Prevents single user from monopolizing resources
- IP-based fallback for requests without email

### ✅ Abuse Prevention
- OTP/password reset still limited per email (5/hour)
- Prevents mass OTP generation attacks
- Admin routes protected with reasonable limits

---

## Real-World Usage Scenarios

### Scenario 1: 200 Faculty Members Login Simultaneously
**Impact:** ✅ No issues
- Each gets 10 failed attempts (most will succeed on first try)
- Successful logins don't count
- Each gets 500 API requests for form work

### Scenario 2: Campus-Wide Network (Single IP)
**Impact:** ✅ No issues
- OTP/password reset tracked by email, not IP
- Login attempts tracked by IP, but with higher limit (10)
- Multiple users can work independently

### Scenario 3: HOD Reviewing 50 Employee Records
**Impact:** ✅ No issues
- 200 requests per 15 minutes
- Viewing one record = ~3-5 requests
- Can review 40-60 records in 15 minutes

### Scenario 4: Admin Managing System
**Impact:** ✅ No issues
- 200 admin requests per 15 minutes
- Can view logs, close sessions, manage users
- Sufficient for administrative tasks

---

## Monitoring Recommendations

### Track These Metrics in Production

1. **Rate Limit Hit Rate**
   ```javascript
   // Check response headers
   RateLimit-Limit: 500
   RateLimit-Remaining: 487
   RateLimit-Reset: 1733506800
   ```

2. **Failed Login Patterns**
   - Monitor users hitting 10-attempt limit
   - May indicate credential issues or attacks

3. **API Usage Distribution**
   - Average requests per user per session
   - Identify any users consistently hitting limits

4. **Peak Usage Times**
   - Identify if limits need seasonal adjustment
   - E.g., evaluation period vs normal time

---

## Adjustment Guidelines

### If Users Complain About Rate Limits

1. **Check Logs First**
   - Are limits actually being hit?
   - Or is it a different issue?

2. **Analyze Usage Pattern**
   - How many requests in typical workflow?
   - Are there inefficient polling patterns?

3. **Gradual Increases**
   - Increase by 50% increments
   - Monitor for 1 week
   - Adjust based on data

### Example: Increase API Limit
```javascript
// In Backend/middleware/rateLimiter.js
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 750, // Increased from 500
  // ... rest of config
});
```

---

## Configuration File

**Location:** `Backend/middleware/rateLimiter.js`

**Current Settings:**
```javascript
loginLimiter:          10 attempts / 15 min (failed only)
apiLimiter:            500 requests / 15 min
otpLimiter:            5 requests / 1 hour (per email)
passwordResetLimiter:  5 requests / 1 hour (per email)
adminLimiter:          200 requests / 15 min
```

---

## Testing Recommendations

### Load Testing
```bash
# Test with 200 concurrent users
npm install -g artillery
artillery quick --count 200 --num 50 http://localhost:9000/app/login
```

### Individual Limit Testing
```bash
# Test login limiter (should block on 11th failed attempt)
for i in {1..11}; do
  curl -X POST http://localhost:9000/app/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "\nAttempt $i"
done
```

---

## Summary

✅ **Rate limits updated to support 200+ concurrent users**  
✅ **Security protections maintained**  
✅ **Email-based limiting prevents network blocking**  
✅ **Generous limits for legitimate usage**  
✅ **Still prevents abuse and attacks**

**Recommendation:** Monitor actual usage for first 2 weeks and adjust if needed.

---

**Updated:** December 6, 2025  
**Configured For:** 200 concurrent users  
**Status:** ✅ Ready for deployment
