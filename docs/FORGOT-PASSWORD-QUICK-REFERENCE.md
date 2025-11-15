# 🔐 Forgot Password - Quick Reference

## ✅ Feature Complete

OTP-based password reset is now fully functional in the Appraisal Management System.

---

## 🚀 Quick Start

### For Users
1. Click **"Forgot Password?"** on login page
2. Enter your registered `@dayanandasagar.edu` email
3. Check email for 6-digit OTP
4. Enter OTP within 10 minutes
5. Create new password (min 6 characters)
6. Login with new credentials

---

## 📡 API Endpoints

```
POST /api/auth/forgot-password       → Request OTP
POST /api/auth/verify-reset-otp      → Verify OTP
POST /api/auth/reset-password        → Set new password
POST /api/auth/resend-reset-otp      → Resend OTP
```

---

## 🗄️ Database

**Collection:** `passwordresetotps`

**Key Fields:**
- `email` - User's email address
- `otp` - 6-digit code
- `expiresAt` - 10 minutes from creation
- `isUsed` - Prevents reuse
- `attempts` - Max 5 attempts

---

## 🔒 Security

✅ **Email Domain:** Only `@dayanandasagar.edu`  
✅ **OTP Expiry:** 10 minutes  
✅ **Rate Limit:** 3 OTPs per hour  
✅ **Max Attempts:** 5 per OTP  
✅ **Single Use:** OTP invalidated after reset  
✅ **Password:** Min 6 characters, bcrypt hashed  

---

## 📧 Email Template

**Subject:** Password Reset OTP  
**Design:** Red security theme with warnings  
**Content:** 6-digit OTP + instructions  

---

## 🧪 Quick Test

```bash
# 1. Request OTP
curl -X POST http://localhost:9000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@dayanandasagar.edu"}'

# 2. Verify OTP
curl -X POST http://localhost:9000/api/auth/verify-reset-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@dayanandasagar.edu","otp":"123456"}'

# 3. Reset Password
curl -X POST http://localhost:9000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@dayanandasagar.edu","otp":"123456","newPassword":"newPass123"}'
```

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Email not registered | User doesn't exist | Use registered email |
| OTP expired | Waited > 10 min | Request new OTP |
| Too many requests | > 3 OTPs in 1 hour | Wait 1 hour |
| Invalid OTP | Wrong code | Check email again |
| OTP already used | Reusing same OTP | Request new OTP |
| Passwords don't match | Typo in confirmation | Re-enter passwords |

---

## 📦 Files Modified

### Backend
- ✅ `model/passwordResetOtp.js` (NEW)
- ✅ `controller/passwordResetController.js` (NEW)
- ✅ `routers/router.js` (MODIFIED)
- ✅ `utils/emailService.js` (MODIFIED)

### Frontend
- ✅ `components/ForgotPassword.jsx` (NEW)
- ✅ `components/OTPVerification.jsx` (MODIFIED)
- ✅ `pages/Auth.jsx` (MODIFIED)

---

## 🎯 User Flow

```
Login Page
    ↓
[Forgot Password?] link
    ↓
Enter Email → Send OTP
    ↓
Enter 6-digit OTP → Verify
    ↓
Enter New Password → Reset
    ↓
Success! → Login
```

---

## 🔧 Environment Setup

Required variables in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 📊 Response Examples

### Success (200)
```json
{
  "success": true,
  "message": "OTP sent to your registered email.",
  "expiresIn": 600
}
```

### Error (400)
```json
{
  "success": false,
  "message": "This email ID is not registered in the system."
}
```

### Rate Limited (429)
```json
{
  "success": false,
  "message": "Too many password reset requests. Please try again after an hour."
}
```

---

## ✨ Key Features

- 🔐 **Secure OTP-based reset**
- ⏱️ **10-minute expiration**
- 🚫 **Rate limiting protection**
- 📧 **Professional email templates**
- ✅ **Real-time validation**
- 🎨 **Smooth UI transitions**
- 🛡️ **Multi-layer security**
- 📱 **Responsive design**

---

## 🎓 Best Practices

1. **Always validate email domain**
2. **Check OTP expiration before use**
3. **Invalidate OTPs after successful reset**
4. **Hash passwords with bcrypt**
5. **Log suspicious activities**
6. **Clear sensitive data after use**
7. **Provide clear error messages**
8. **Test rate limiting thoroughly**

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** November 15, 2025
