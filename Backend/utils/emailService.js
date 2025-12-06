import nodemailer from 'nodemailer';
import { logger, maskEmail } from './securityLogger.js';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Appraisal Management System" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Your Account Verification OTP',
      html: `
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
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #4F46E5;
            }
            .header h1 {
              color: #4F46E5;
              margin: 0;
            }
            .content {
              padding: 30px 0;
            }
            .otp-box {
              background-color: #F3F4F6;
              padding: 20px;
              text-align: center;
              border-radius: 8px;
              margin: 20px 0;
            }
            .otp {
              font-size: 32px;
              font-weight: bold;
              color: #4F46E5;
              letter-spacing: 5px;
            }
            .warning {
              color: #DC2626;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              color: #6B7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appraisal Management System</h1>
            </div>
            <div class="content">
              <h2>Email Verification</h2>
              <p>Thank you for creating an account with us. Please use the OTP below to verify your email address:</p>
              <div class="otp-box">
                <div class="otp">${otp}</div>
              </div>
              <p><strong>This OTP is valid for 10 minutes.</strong></p>
              <p class="warning">⚠️ Do not share this code with anyone. We will never ask for your OTP.</p>
            </div>
            <div class="footer">
              <p>If you didn't request this OTP, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} Appraisal Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Your OTP for creating your account is: ${otp}\n\nValid for 10 minutes. Do not share this code with anyone.`
    };

    const info = await transporter.sendMail(mailOptions);
    logger.success('OTP email sent', maskEmail(email));
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email sending error', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email after successful registration
export const sendWelcomeEmail = async (email, role) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Appraisal Management System" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Welcome to Appraisal Management System',
      html: `
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
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #10B981;
            }
            .header h1 {
              color: #10B981;
              margin: 0;
            }
            .content {
              padding: 30px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #4F46E5;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              color: #6B7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome! 🎉</h1>
            </div>
            <div class="content">
              <h2>Your Account is Ready</h2>
              <p>Your account has been successfully created with the role of <strong>${role}</strong>.</p>
              <p>You can now log in and start using the Appraisal Management System.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Appraisal Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Appraisal Management System!\n\nYour account has been successfully created with the role of ${role}.\n\nYou can now log in and start using the system.`
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Welcome email error:', error);
    // Don't throw error for welcome email - it's not critical
  }
};

// Send Password Reset OTP email
export const sendPasswordResetOTP = async (email, otp, role) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Appraisal Management System" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Password Reset OTP',
      html: `
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
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #DC2626;
            }
            .header h1 {
              color: #DC2626;
              margin: 0;
            }
            .content {
              padding: 30px 0;
            }
            .otp-box {
              background-color: #FEF2F2;
              padding: 20px;
              text-align: center;
              border-radius: 8px;
              margin: 20px 0;
              border: 2px solid #DC2626;
            }
            .otp {
              font-size: 32px;
              font-weight: bold;
              color: #DC2626;
              letter-spacing: 5px;
            }
            .warning {
              color: #DC2626;
              font-size: 14px;
              margin-top: 20px;
              background-color: #FEF2F2;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #DC2626;
            }
            .info-box {
              background-color: #EFF6FF;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
              border-left: 4px solid #3B82F6;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              color: #6B7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
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
                  <li>If you didn't request this, please ignore this email and secure your account</li>
                </ul>
              </div>
              <div class="info-box">
                <strong>ℹ️ What to do next:</strong>
                <ol style="margin: 10px 0; padding-left: 20px;">
                  <li>Enter this OTP on the password reset page</li>
                  <li>Create a new strong password</li>
                  <li>Confirm your new password</li>
                  <li>Login with your new credentials</li>
                </ol>
              </div>
            </div>
            <div class="footer">
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>&copy; ${new Date().getFullYear()} Appraisal Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Password Reset OTP\n\nWe received a request to reset your password.\n\nYour OTP: ${otp}\n\nValid for 10 minutes.\n\nDo not share this code with anyone.\n\nIf you didn't request this, please ignore this email.`
    };

    const info = await transporter.sendMail(mailOptions);
    logger.success('Password reset OTP sent', maskEmail(email));
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Password reset email error', error);
    throw new Error('Failed to send password reset email');
  }
};

