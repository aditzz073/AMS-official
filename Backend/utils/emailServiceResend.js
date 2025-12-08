import { logger, maskEmail } from './securityLogger.js';

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email via Resend API
const sendEmailViaResend = async (to, subject, html, text) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: subject,
      html: html,
      text: text
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email');
  }

  return await response.json();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .otp-box {
            background-color: #f8f9fa;
            border: 2px dashed #4CAF50;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp {
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
            letter-spacing: 5px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Thank you for registering!</p>
            <p>Please use the following OTP to verify your email address:</p>
            <div class="otp-box">
              <div class="otp">${otp}</div>
            </div>
            <p><strong>This OTP is valid for 10 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Appraisal Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Email Verification\n\nYour OTP: ${otp}\n\nValid for 10 minutes.\n\nIf you didn't request this, please ignore this email.`;

    const result = await sendEmailViaResend(email, 'Email Verification OTP', html, text);
    logger.success('OTP email sent', maskEmail(email));
    return { success: true, messageId: result.id };
  } catch (error) {
    logger.error('OTP email error', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send password reset OTP
export const sendPasswordResetOTP = async (email, otp, role = 'User') => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #2196F3;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .otp-box {
            background-color: #f8f9fa;
            border: 2px dashed #2196F3;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp {
            font-size: 32px;
            font-weight: bold;
            color: #2196F3;
            letter-spacing: 5px;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>We received a request to reset the password for your account (${role}).</p>
            <p>Use the OTP below to reset your password:</p>
            <div class="otp-box">
              <div class="otp">${otp}</div>
            </div>
            <p><strong>This OTP is valid for 10 minutes.</strong></p>
            <div class="warning">
              <strong>⚠️ Security Warning:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Do not share this code with anyone</li>
                <li>We will never ask for your OTP via phone or chat</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>If you didn't request a password reset, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Appraisal Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Password Reset OTP\n\nWe received a request to reset your password.\n\nYour OTP: ${otp}\n\nValid for 10 minutes.\n\nDo not share this code with anyone.\n\nIf you didn't request this, please ignore this email.`;

    const result = await sendEmailViaResend(email, 'Password Reset OTP', html, text);
    logger.success('Password reset OTP sent', maskEmail(email));
    return { success: true, messageId: result.id };
  } catch (error) {
    logger.error('Password reset email error', error);
    throw new Error('Failed to send password reset email');
  }
};
