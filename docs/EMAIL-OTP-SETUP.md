# Email OTP Verification - Environment Configuration

## Required Environment Variables

Add the following variables to your `.env` file in the Backend directory:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Existing variables (keep as is)
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-uri
NODE_ENV=development
```

## Gmail Setup Instructions

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** > **2-Step Verification**
3. Follow the instructions to enable 2FA

### Step 2: Generate App Password
1. After enabling 2FA, go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other** as the device and enter "Appraisal System"
4. Click **Generate**
5. Copy the 16-character password
6. Paste it as `SMTP_PASSWORD` in your `.env` file

### Step 3: Update .env File
```env
SMTP_EMAIL=youremail@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # The 16-char password from Step 2
```

## Alternative Email Services

### Using Other SMTP Services:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_EMAIL=your-email@outlook.com
SMTP_PASSWORD=your-password
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_EMAIL=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_EMAIL=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## Testing the Email Service

After configuring, test the email service by:

1. Start the backend server:
   ```bash
   cd Backend
   npm start
   ```

2. Use the signup flow to request an OTP
3. Check your email inbox (and spam folder)

## Troubleshooting

### Email not sending:
- Verify SMTP credentials are correct
- Check if 2FA is enabled (for Gmail)
- Ensure app password is used, not regular password
- Check firewall/network settings
- Look at backend console for error messages

### "Less secure app" error (Gmail):
- Use App Passwords instead (see Step 2 above)
- Never use regular Gmail password

### OTP not received:
- Check spam/junk folder
- Verify email address is correct
- Check backend logs for email sending errors
- Ensure SMTP_PORT is 587 (not 465)

## Security Best Practices

1. **Never commit .env file** - Already in .gitignore
2. **Use app-specific passwords** - Never use main email password
3. **Rotate passwords regularly** - Change app passwords periodically
4. **Use environment variables** - Never hardcode credentials
5. **Enable 2FA** - For additional security

## Rate Limiting

The system implements:
- **3 OTP requests per hour** per email
- **10-minute OTP expiration**
- **5 verification attempts** per OTP
- Automatic cleanup of expired OTPs

## Email Templates

The system sends two types of emails:

1. **OTP Verification Email** - Sent during signup
2. **Welcome Email** - Sent after successful registration

Both use branded HTML templates with your institution's branding.
