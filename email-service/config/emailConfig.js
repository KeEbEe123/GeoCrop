import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Gmail SMTP transporter with optimized settings for cloud deployment
export const createTransporter = () => {
  const config = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    // Optimized settings for cloud platforms like Render
    connectionTimeout: 30000, // 30 seconds (reduced from 60)
    greetingTimeout: 15000, // 15 seconds (reduced from 30)
    socketTimeout: 30000, // 30 seconds (reduced from 60)
    // Connection pooling for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Retry settings
    retry: {
      attempts: 3,
      delay: 2000
    },
    // TLS settings optimized for cloud
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3',
      minVersion: 'TLSv1.2'
    },
    // Additional cloud-friendly settings
    requireTLS: true,
    logger: process.env.NODE_ENV === 'development',
    debug: process.env.NODE_ENV === 'development'
  };

  return nodemailer.createTransport(config);
};

// Verify transporter configuration with timeout and retry logic
export const verifyTransporter = async (transporter) => {
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds between retries
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Verifying SMTP connection (attempt ${attempt}/${maxRetries})...`);
      
      // Create a promise that times out after 20 seconds
      const verificationPromise = transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 20000)
      );
      
      await Promise.race([verificationPromise, timeoutPromise]);
      console.log('✅ SMTP server is ready to send emails');
      return true;
      
    } catch (error) {
      console.error(`❌ SMTP verification attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        // On final attempt, handle based on environment
        if (process.env.NODE_ENV === 'production') {
          console.warn('⚠️  All SMTP verification attempts failed in production');
          console.warn('⚠️  Service will continue and attempt connection on first email send');
          return false; // Don't fail completely in production
        } else {
          console.error('❌ SMTP verification failed in development mode');
          return false;
        }
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${retryDelay/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  return false;
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