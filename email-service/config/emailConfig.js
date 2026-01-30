import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Gmail SMTP transporter
export const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Verify transporter configuration
export const verifyTransporter = async (transporter) => {
  try {
    await transporter.verify();
    console.log('✅ SMTP server is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ SMTP server verification failed:', error.message);
    return false;
  }
};

// Email configuration
export const emailConfig = {
  from: {
    name: process.env.APP_NAME || 'Yield Mentor',
    address: process.env.GMAIL_USER
  },
  supportEmail: process.env.SUPPORT_EMAIL || 'support@yieldmentor.com',
  appUrl: process.env.APP_URL || 'http://localhost:5173'
};