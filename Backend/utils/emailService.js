import nodemailer from "nodemailer";
import { logger, maskEmail } from "./securityLogger.js";
import { transporter } from "../server.js";

const sendMail = async (to, subject, html, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"Appraisal Management System" <${process.env.GMAIL_APP_ID}>`,
      to,
      subject,
      html,
      text,
    });

    return info;
  } catch (error) {
    logger.error("Email sending failed", error);
    throw new Error("Email sending failed");
  }
};


export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();



const baseTemplate = (title, content, color = "#4F46E5") => `
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
      border-bottom: 2px solid ${color};
    }
    .header h1 {
      color: ${color};
      margin: 0;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      color: #6B7280;
      font-size: 12px;
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
      color: ${color};
      letter-spacing: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Appraisal Management System</p>
    </div>
  </div>
</body>
</html>
`;


export const sendOTPEmail = async (email, otp) => {
  try {
    const html = baseTemplate(
      "Email Verification",
      `
      <p>Please use the OTP below to verify your email:</p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
      </div>
      <p><strong>This OTP is valid for 10 minutes.</strong></p>
      <p style="color:#DC2626;">⚠️ Do not share this code with anyone.</p>
      `
    );

    const text = `Your OTP is ${otp}. Valid for 10 minutes.`;

    const result = await sendMail(
      email,
      "Your Account Verification OTP",
      html,
      text
    );

    logger.success("OTP email sent", maskEmail(email));
    return { success: true, messageId: result.messageId };
  } catch (error) {
    throw new Error("Failed to send OTP email");
  }
};



export const sendWelcomeEmail = async (email, role) => {
  try {
    const html = baseTemplate(
      "Welcome 🎉",
      `
      <p>Your account has been created successfully.</p>
      <p><strong>Role:</strong> ${role}</p>
      <p>You can now log in and start using the system.</p>
      `,
      "#10B981"
    );

    const text = `Welcome! Your account has been created with role ${role}.`;

    await sendMail(email, "Welcome to Appraisal Management System", html, text);

    logger.success("Welcome email sent", maskEmail(email));
  } catch (error) {
    logger.error("Welcome email failed", error);
  }
};


export const sendPasswordResetOTP = async (email, otp, role) => {
  try {
    const html = baseTemplate(
      "Password Reset 🔐",
      `
      <p>We received a request to reset your password.</p>
      <p><strong>Role:</strong> ${role}</p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
      </div>
      <p><strong>This OTP is valid for 10 minutes.</strong></p>
      <p style="color:#DC2626;">
        ⚠️ If you didn't request this, please ignore this email.
      </p>
      `,
      "#DC2626"
    );

    const text = `Password Reset OTP: ${otp}. Valid for 10 minutes.`;

    const result = await sendMail(
      email,
      "Password Reset OTP",
      html,
      text
    );

    logger.success("Password reset OTP sent", maskEmail(email));
    return { success: true, messageId: result.messageId };
  } catch (error) {
    throw new Error("Failed to send password reset email");
  }
};
