import { logger, maskEmail } from './securityLogger.js';

/* =========================
   Generate 6-digit OTP
========================= */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* =========================
   Send Email via Resend
========================= */
const sendEmailViaResend = async (to, subject, html, text) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  // Updated to match your Render Environment Key
  const FROM_EMAIL = process.env.FROM_EMAIL;

  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  if (!FROM_EMAIL) {
    throw new Error('FROM_EMAIL environment variable is missing');
  }

  console.log(`📧 Sending email to: ${to}`);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL, // Uses "AMS DSCE <no-reply@amsdsce.com>"
      to: [to],        // Sends directly to the user's email
      subject: subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email');
  }

  return await response.json();
};

/* =========================
   Send OTP Email
========================= */
export const sendOTPEmail = async (email, otp) => {
  try {
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:10px; border: 1px solid #ddd;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your OTP for the Appraisal Management System is:</p>
            <div style="font-size:32px; font-weight:bold; letter-spacing:5px; color:#4F46E5; padding: 10px 0;">
              ${otp}
            </div>
            <p><strong>Valid for 10 minutes.</strong></p>
            <p style="color:red;">Do not share this OTP with anyone.</p>
          </div>
        </body>
      </html>
    `;

    const text = `Your OTP for account verification is: ${otp}. Valid for 10 minutes.`;

    const result = await sendEmailViaResend(
      email,
      'Your Account Verification OTP',
      html,
      text
    );

    logger.success('OTP email sent', maskEmail(email));

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('❌ OTP email error (full):', error.message);
    logger.error('Email sending error', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

/* =========================
   Send Welcome Email
========================= */
export const sendWelcomeEmail = async (email, role) => {
  try {
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:10px; border: 1px solid #ddd;">
            <h2>Welcome 🎉</h2>
            <p>Your account has been created successfully in the AMS DSCE system.</p>
            <p><strong>Role:</strong> ${role}</p>
          </div>
        </body>
      </html>
    `;

    const text = `Welcome! Your account has been created with the role: ${role}.`;

    await sendEmailViaResend(
      email,
      'Welcome to Appraisal Management System',
      html,
      text
    );

    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Welcome email error:', error);
    // Not critical, so not throwing
  }
};

/* =========================
   Send Password Reset OTP
========================= */
export const sendPasswordResetOTP = async (email, otp, role) => {
  try {
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:10px; border: 1px solid #ddd;">
            <h2>Password Reset Request 🔐</h2>
            <p>Account Role: <strong>${role}</strong></p>
            <p>Your OTP:</p>
            <div style="font-size:32px; font-weight:bold; letter-spacing:5px; color:#DC2626; padding: 10px 0;">
              ${otp}
            </div>
            <p><strong>Valid for 10 minutes.</strong></p>
            <p style="color:red;">
              Do not share this code with anyone. If you didn’t request this, ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `Your Password Reset OTP: ${otp}. Valid for 10 minutes.`;

    const result = await sendEmailViaResend(
      email,
      'Password Reset OTP',
      html,
      text
    );

    logger.success('Password reset OTP sent', maskEmail(email));

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('❌ Password reset email error (full):', error.message);
    logger.error('Password reset email error', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};
