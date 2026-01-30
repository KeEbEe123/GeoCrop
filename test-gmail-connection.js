// Test Gmail SMTP connection directly
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './email-service/.env' });

const testGmailConnection = async () => {
  console.log('🧪 Testing Gmail SMTP connection...');
  console.log('📧 Gmail User:', process.env.GMAIL_USER);
  console.log('🔑 App Password length:', process.env.GMAIL_APP_PASSWORD?.length);
  console.log('🔑 App Password format:', process.env.GMAIL_APP_PASSWORD?.replace(/./g, '*'));

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    debug: true, // Enable debug output
    logger: true // Enable logging
  });

  try {
    console.log('🔍 Verifying transporter...');
    await transporter.verify();
    console.log('✅ Gmail SMTP connection successful!');
    
    // Try sending a test email
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to self
      subject: 'Test Email from Render',
      text: 'This is a test email to verify SMTP connection from Render deployment.',
      html: '<h1>Test Email</h1><p>This is a test email to verify SMTP connection from Render deployment.</p>'
    });
    
    console.log('✅ Test email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('❌ Gmail SMTP connection failed:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
  }
};

testGmailConnection();