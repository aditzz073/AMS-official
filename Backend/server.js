import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config(); // Load .env variables

import app from "./app.js";
import connection from "./dbConnect.js";
import cloudinary from "cloudinary";
import { validateJWTSecret } from "./utils/securityLogger.js";

// Validate JWT_SECRET on startup
try {
  validateJWTSecret();
  console.log('✅ JWT_SECRET validation passed');
} catch (error) {
  console.error('❌ SECURITY ERROR:', error.message);
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ Server will not start with weak JWT_SECRET in production');
    process.exit(1);
  } else {
    console.warn('⚠️  Continuing in development mode, but FIX THIS before production!');
  }
}

// Connect to MongoDB
connection();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_APP_ID,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server is running on http://localhost:${PORT}`);
  } else {
    console.log(`Server started in production mode on port ${PORT}`);
  }
});

export default cloudinary;

