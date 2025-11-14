# 📧 Email OTP Verification System

A secure email-based OTP verification system for account creation in the Appraisal Management System.

## ✨ Features

- ✅ **6-digit OTP generation** with 10-minute expiration
- ✅ **Email verification** required before account creation
- ✅ **Rate limiting** - Maximum 3 OTP requests per hour
- ✅ **Resend OTP** functionality with countdown timer
- ✅ **Auto-focus & paste support** for seamless UX
- ✅ **Branded email templates** with HTML formatting
- ✅ **Welcome email** sent after successful registration
- ✅ **Security features** - Attempt limits, expiry checks, duplicate prevention

## 🔄 User Flow

### Sign Up Process

1. **User enters credentials**
   - Email address
   - Password
   - Confirm password
   - Role selection

2. **System validates and sends OTP**
   - Validates email format
   - Checks for existing accounts
   - Generates 6-digit OTP
   - Sends OTP via email

3. **User verifies email**
   - Enters 6-digit OTP
   - Can resend OTP if needed
   - System validates OTP

4. **Account creation**
   - After OTP verification, account is created
   - Welcome email is sent
   - User is logged in automatically

## 🛠️ Technical Implementation

### Backend Components

#### 1. Email Verification OTP Model
**Location:** `Backend/model/emailVerificationOtp.js`

```javascript
{
  email: String,
  otp: String (6 digits),
  expiresAt: Date,
  isUsed: Boolean,
  attempts: Number,
  createdAt: Date
}
```

**Features:**
- TTL index for automatic deletion of expired OTPs
- Rate limiting check (3 requests/hour)
- Validation methods

#### 2. Email Service
**Location:** `Backend/utils/emailService.js`

**Functions:**
- `generateOTP()` - Generates 6-digit numeric OTP
- `sendOTPEmail(email, otp)` - Sends OTP verification email
- `sendWelcomeEmail(email, role)` - Sends welcome email after registration

**Email Templates:**
- Branded HTML templates
- Responsive design
- Professional styling

#### 3. OTP Controller
**Location:** `Backend/controller/otpController.js`

**Endpoints:**

##### POST `/auth/request-otp`
Request OTP for email verification

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "expiresIn": 600
}
```

**Validations:**
- Email format validation
- Duplicate account check
- Rate limiting (3 OTPs/hour)
- Invalidates previous unused OTPs

##### POST `/auth/verify-otp`
Verify OTP code

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "email": "user@example.com"
}
```

**Validations:**
- 6-digit OTP format check
- Expiration check (10 minutes)
- Maximum 5 verification attempts
- Marks OTP as used after success

##### POST `/auth/resend-otp`
Resend OTP to email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New OTP sent successfully",
  "expiresIn": 600
}
```

#### 4. Updated Auth Controller
**Location:** `Backend/controller/authController.js`

**Changes to `/signup` endpoint:**
- Now requires email verification before account creation
- Checks for verified OTP (used within last 15 minutes)
- Marks user email as verified
- Sends welcome email after registration

#### 5. User Model Update
**Location:** `Backend/model/user.js`

**New field:**
```javascript
emailVerified: {
  type: Boolean,
  default: false
}
```

### Frontend Components

#### 1. OTP Verification Component
**Location:** `Frontend/src/components/OTPVerification.jsx`

**Features:**
- 6 individual input boxes for OTP digits
- Auto-focus next input on digit entry
- Backspace navigation between inputs
- Paste support (detects and distributes digits)
- 10-minute countdown timer
- Resend OTP button (enabled after expiry)
- Visual feedback and animations
- Error handling

**Props:**
- `email` - Email address to verify
- `onVerified` - Callback when OTP is verified
- `onBack` - Callback to go back to signup

#### 2. Updated Auth Page
**Location:** `Frontend/src/pages/Auth.jsx`

**Changes:**
- Added `showOTP` state for flow control
- Multi-step signup process:
  1. Enter credentials
  2. Verify OTP
  3. Create account
- AnimatePresence for smooth transitions
- Separate handlers for OTP flow

## 🔒 Security Features

### Rate Limiting
- **3 OTP requests per hour** per email address
- Prevents spam and abuse
- Returns 429 status code when limit exceeded

### OTP Expiration
- OTPs valid for **10 minutes**
- Automatic cleanup via MongoDB TTL index
- Clear expiration countdown in UI

### Verification Attempts
- Maximum **5 attempts** per OTP
- OTP marked as used after 5 failed attempts
- User must request new OTP after limit

### Duplicate Prevention
- Checks for existing accounts before sending OTP
- Invalidates previous unused OTPs
- Prevents multiple concurrent OTPs

### Password Security
- Passwords hashed with bcrypt (existing)
- Minimum 6 characters
- Confirmation required

### Email Validation
- Format validation (regex)
- Domain validation
- Case-insensitive storage

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
cd Backend
npm install nodemailer
```

### 2. Configure Environment Variables

Create/update `.env` file in Backend directory:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Existing variables
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-uri
NODE_ENV=development
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password as `SMTP_PASSWORD`

📖 **Detailed setup:** See `docs/EMAIL-OTP-SETUP.md`

### 3. Start the Application

**Backend:**
```bash
cd Backend
npm start
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

## 🧪 Testing the Feature

### Manual Testing

1. **Start both servers** (Backend & Frontend)

2. **Navigate to signup page**
   - Click "Create Account" on login page

3. **Enter signup details:**
   - Email: Use a real email you have access to
   - Password: Any password (min 6 chars)
   - Confirm Password: Match password
   - Role: Select any role

4. **Click "Create Account"**
   - OTP screen should appear
   - Check your email for OTP code
   - Check spam folder if not in inbox

5. **Enter OTP:**
   - Type or paste the 6-digit code
   - Click "Verify Email"
   - Should redirect to dashboard

6. **Verify account creation:**
   - Check MongoDB for new user
   - Check email for welcome message
   - Try logging out and back in

### Testing Edge Cases

**Rate Limiting:**
- Request 4+ OTPs within an hour
- Should see "Too many OTP requests" error

**Expired OTP:**
- Wait 10+ minutes after receiving OTP
- Try to verify - should see expiry error

**Invalid OTP:**
- Enter wrong 6-digit code
- Try 5+ times - should require new OTP

**Resend OTP:**
- Click "Resend OTP" after expiry
- New OTP should arrive

**Duplicate Account:**
- Try to sign up with existing email
- Should see "Email already registered" error

## 🚨 Troubleshooting

### OTP Email Not Received

**Check spam folder first!**

Then verify:
1. SMTP credentials in `.env`
2. App password (not regular password for Gmail)
3. 2FA enabled on Gmail
4. Backend console for errors
5. Network/firewall settings

### "Too Many Requests" Error

- Wait 1 hour before requesting new OTP
- Or use different email address
- This is a security feature

### OTP Verification Failed

- Ensure OTP is entered correctly
- Check if OTP is expired (10 min limit)
- Try resending OTP
- Check backend logs for errors

### Email Sending Errors

**"Invalid login":**
- Use app password, not regular password
- Enable 2FA on Gmail

**"Connection timeout":**
- Check SMTP_PORT (should be 587)
- Verify firewall settings
- Try different SMTP service

### Frontend Issues

**OTP screen not showing:**
- Check browser console for errors
- Verify axios request succeeds
- Check network tab for API response

**Auto-focus not working:**
- Clear browser cache
- Check for React errors
- Try different browser

## 📊 Database Schema

### EmailVerificationOtp Collection

```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  otp: "123456",
  expiresAt: ISODate("2025-11-15T12:00:00Z"),
  isUsed: false,
  attempts: 0,
  createdAt: ISODate("2025-11-15T11:50:00Z")
}
```

**Indexes:**
- `{ email: 1, createdAt: -1 }`
- `{ expiresAt: 1 }` (TTL index)

### User Collection Update

Added field:
```javascript
{
  // ... existing fields
  emailVerified: true,
  // ...
}
```

## 🎨 UI/UX Features

### OTP Input Component

- **6 individual boxes** - Clear visual separation
- **Auto-focus** - Seamless input experience
- **Paste support** - One-click paste from clipboard
- **Keyboard navigation** - Backspace moves to previous box
- **Visual timer** - Countdown display
- **Resend button** - Appears after expiry
- **Loading states** - Clear feedback on actions
- **Error handling** - Informative error messages
- **Animations** - Smooth transitions with Framer Motion

### Email Templates

- **Branded design** - Institution logo and colors
- **Responsive** - Works on all devices
- **Professional** - Clean, modern styling
- **Clear CTA** - Prominent OTP display
- **Security warnings** - "Don't share" message

## 🔐 Security Best Practices

✅ **Use environment variables** - Never hardcode credentials  
✅ **App-specific passwords** - Never use main email password  
✅ **Rate limiting** - Prevent abuse  
✅ **OTP expiration** - Time-limited codes  
✅ **Attempt limits** - Max 5 verification tries  
✅ **HTTPS in production** - Secure communication  
✅ **Input validation** - Server-side validation  
✅ **Error messages** - Don't reveal sensitive info  

## 📝 API Error Codes

| Status Code | Error | Description |
|------------|-------|-------------|
| 400 | Invalid email format | Email doesn't match regex |
| 400 | Email already registered | Account exists |
| 400 | Invalid OTP | Wrong 6-digit code |
| 400 | OTP expired | More than 10 minutes old |
| 403 | Email verification required | OTP not verified |
| 429 | Too many requests | Rate limit exceeded |
| 500 | Server error | Internal server error |

## 🚀 Future Enhancements

- [ ] SMS OTP as alternative
- [ ] Social authentication (Google, Microsoft)
- [ ] Magic link authentication
- [ ] Biometric authentication
- [ ] Remember device feature
- [ ] Advanced fraud detection
- [ ] Email verification reminder
- [ ] Custom OTP length configuration
- [ ] Multi-language email templates

## 📚 Related Documentation

- [Email Setup Guide](./EMAIL-OTP-SETUP.md) - Detailed SMTP configuration
- [Login Activity Tracking](./LOGIN-ACTIVITY-TRACKING-GUIDE.md) - Session management
- [Role-Based Access](./FPMI-ROLE-IMPLEMENTATION.md) - User roles and permissions

## 🤝 Contributing

When modifying the OTP system:

1. Update both backend and frontend
2. Test all edge cases
3. Update this documentation
4. Verify email templates render correctly
5. Check rate limiting works
6. Test with multiple email providers

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend console logs
3. Check browser console for frontend errors
4. Verify environment configuration
5. Test with different email provider

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
