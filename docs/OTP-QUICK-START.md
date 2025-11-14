# 🚀 OTP Verification - Quick Start Guide

## ⚡ Setup in 5 Minutes

### Step 1: Update Backend .env (2 min)

Open `Backend/.env` and add your Gmail credentials:

```env
SMTP_EMAIL=youremail@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

**Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate password for "Mail" app
3. Copy 16-character code
4. Paste as SMTP_PASSWORD

### Step 2: Start Servers (1 min)

**Terminal 1 - Backend:**
```bash
cd Backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### Step 3: Test It! (2 min)

1. Open http://localhost:5173
2. Click "Create Account"
3. Fill in details with YOUR real email
4. Click "Create Account"
5. Check your email for 6-digit OTP
6. Enter OTP and verify
7. Done! ✅

## 📋 Quick Reference

### API Endpoints

```bash
# Request OTP
POST /auth/request-otp
Body: { "email": "user@example.com" }

# Verify OTP
POST /auth/verify-otp
Body: { "email": "user@example.com", "otp": "123456" }

# Resend OTP
POST /auth/resend-otp
Body: { "email": "user@example.com" }

# Register (after OTP verified)
POST /signup
Body: { "email": "user@example.com", "password": "pass123", "role": "faculty" }
```

### Frontend Flow

```javascript
// 1. User fills signup form
// 2. Request OTP
await axiosInstance.post("/auth/request-otp", { email });

// 3. Show OTP input screen
<OTPVerification email={email} onVerified={handleVerified} />

// 4. Verify OTP
await axiosInstance.post("/auth/verify-otp", { email, otp });

// 5. Create account
await axiosInstance.post("/signup", { email, password, role });
```

### Security Limits

| Feature | Limit |
|---------|-------|
| OTP Validity | 10 minutes |
| OTP Requests | 3 per hour per email |
| Verification Attempts | 5 per OTP |
| OTP Length | 6 digits |

## 🐛 Common Issues

**Email not received?**
- Check spam folder
- Verify SMTP credentials in .env
- Use app password, not regular password

**"Too many requests"?**
- Wait 1 hour or use different email
- This is a security feature

**"Invalid OTP"?**
- Check if expired (10 min)
- Try resending OTP
- Ensure all 6 digits entered

## 📁 Files Created/Modified

### Backend
- ✅ `model/emailVerificationOtp.js` - OTP model
- ✅ `utils/emailService.js` - Email sending
- ✅ `controller/otpController.js` - OTP logic
- ✅ `controller/authController.js` - Updated signup
- ✅ `routers/router.js` - New routes
- ✅ `model/user.js` - Added emailVerified field

### Frontend
- ✅ `components/OTPVerification.jsx` - OTP UI
- ✅ `pages/Auth.jsx` - Updated flow

### Documentation
- ✅ `docs/OTP-VERIFICATION-SYSTEM.md` - Full guide
- ✅ `docs/EMAIL-OTP-SETUP.md` - Email setup
- ✅ `docs/OTP-QUICK-START.md` - This file

## 🎯 Testing Checklist

- [ ] OTP received in email
- [ ] OTP verifies successfully
- [ ] Account created after verification
- [ ] Welcome email received
- [ ] Can login with new account
- [ ] Rate limiting works (try 4th request)
- [ ] Expiry works (wait 10+ min)
- [ ] Resend OTP works
- [ ] Invalid OTP shows error
- [ ] Duplicate email prevention works

## 📞 Need Help?

1. **Check full documentation:** `docs/OTP-VERIFICATION-SYSTEM.md`
2. **Email setup guide:** `docs/EMAIL-OTP-SETUP.md`
3. **Check backend logs** for error messages
4. **Check browser console** for frontend errors

## 🎉 Success Indicators

✅ OTP email received within seconds  
✅ OTP verification succeeds  
✅ Account created successfully  
✅ Welcome email received  
✅ Auto-login after signup  
✅ Can logout and login again  

---

**Ready to go?** Start with Step 1 above! 🚀
