import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Gmail SMTP transporter
export const createTransporter = () => {
  const config = {
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
  };

  // Add additional timeout settings for production
  if (process.env.NODE_ENV === 'production') {
    config.connectionTimeout = 60000; // 60 seconds
    config.greetingTimeout = 30000; // 30 seconds
    config.socketTimeout = 60000; // 60 seconds
  }

  return nodemailer.createTransport(config);
};

// Verify transporter configuration
export const verifyTransporter = async (transporter) => {
  try {
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP server is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ SMTP server verification failed:', error.message);
    
    // In production, don't fail completely - allow service to start
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Continuing in production mode without SMTP verification');
      console.warn('⚠️  Emails may fail until SMTP connection is established');
      return false;
    }
    
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