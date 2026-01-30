import { createTransporter, verifyTransporter, emailConfig } from '../config/emailConfig.js';
import { generateWelcomeEmail } from '../templates/welcomeEmail.js';
import { generateOrderStatusEmail } from '../templates/orderStatusEmail.js';
import { generateNewOrderEmail } from '../templates/newOrderEmail.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isReady = false;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing email service...');
      console.log('📧 Gmail User:', process.env.GMAIL_USER);
      console.log('🔑 App Password configured:', !!process.env.GMAIL_APP_PASSWORD);
      
      this.transporter = createTransporter();
      
      // In production, try to verify but don't fail if it doesn't work immediately
      if (process.env.NODE_ENV === 'production') {
        console.log('🏭 Production mode: Attempting SMTP verification with timeout...');
        
        // Set a timeout for verification in production
        const verificationPromise = verifyTransporter(this.transporter);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification timeout')), 10000)
        );
        
        try {
          this.isReady = await Promise.race([verificationPromise, timeoutPromise]);
        } catch (error) {
          console.warn('⚠️  SMTP verification failed or timed out:', error.message);
          console.warn('⚠️  Service will continue and retry on first email send');
          this.isReady = false;
        }
      } else {
        this.isReady = await verifyTransporter(this.transporter);
      }
      
      return true; // Always return true in production to allow service to start
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isReady = false;
      return process.env.NODE_ENV === 'production'; // Allow service to start in production
    }
  }

  async sendWelcomeEmail(userData) {
    // Try to reinitialize if not ready (with retry logic)
    if (!this.isReady) {
      console.log('📧 Email service not ready, attempting to reinitialize...');
      for (let i = 0; i < 3; i++) {
        try {
          this.transporter = createTransporter();
          this.isReady = await verifyTransporter(this.transporter);
          if (this.isReady) break;
        } catch (error) {
          console.warn(`⚠️  Retry ${i + 1}/3 failed:`, error.message);
          if (i < 2) await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
        }
      }
    }

    // In production, try to send even if verification failed
    if (!this.isReady && process.env.NODE_ENV !== 'production') {
      throw new Error('Email service is not ready. Please check SMTP configuration.');
    }

    try {
      const { subject, html, text } = generateWelcomeEmail(userData);
      
      const mailOptions = {
        from: {
          name: emailConfig.from.name,
          address: emailConfig.from.address
        },
        to: userData.email,
        subject: subject,
        html: html,
        text: text,
        headers: {
          'X-Mailer': 'Yield Mentor Email Service',
          'X-Priority': '3'
        }
      };

      // Ensure we have a transporter
      if (!this.transporter) {
        this.transporter = createTransporter();
      }

      const result = await this.transporter.sendMail(mailOptions);
      
      // Mark as ready if send was successful
      this.isReady = true;
      
      console.log('✅ Welcome email sent successfully:', {
        messageId: result.messageId,
        to: userData.email,
        subject: subject
      });

      return {
        success: true,
        messageId: result.messageId,
        message: 'Welcome email sent successfully'
      };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendOrderStatusEmail(orderData) {
    if (!this.isReady) {
      throw new Error('Email service is not ready. Please check SMTP configuration.');
    }

    try {
      const { subject, html, text } = generateOrderStatusEmail(orderData);
      
      const mailOptions = {
        from: {
          name: emailConfig.from.name,
          address: emailConfig.from.address
        },
        to: orderData.buyerEmail,
        subject: subject,
        html: html,
        text: text,
        headers: {
          'X-Mailer': 'GeoCrop Email Service',
          'X-Priority': '3'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Order status email sent successfully:', {
        messageId: result.messageId,
        to: orderData.buyerEmail,
        orderId: orderData.orderId,
        status: orderData.status
      });

      return {
        success: true,
        messageId: result.messageId,
        message: 'Order status email sent successfully'
      };
    } catch (error) {
      console.error('❌ Failed to send order status email:', error);
      throw new Error(`Failed to send order status email: ${error.message}`);
    }
  }

  async sendNewOrderEmail(orderData) {
    if (!this.isReady) {
      throw new Error('Email service is not ready. Please check SMTP configuration.');
    }

    try {
      const { subject, html, text } = generateNewOrderEmail(orderData);
      
      const mailOptions = {
        from: {
          name: emailConfig.from.name,
          address: emailConfig.from.address
        },
        to: orderData.sellerEmail,
        subject: subject,
        html: html,
        text: text,
        headers: {
          'X-Mailer': 'GeoCrop Email Service',
          'X-Priority': '2' // Higher priority for new orders
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ New order email sent successfully:', {
        messageId: result.messageId,
        to: orderData.sellerEmail,
        orderId: orderData.orderId,
        itemName: orderData.itemName
      });

      return {
        success: true,
        messageId: result.messageId,
        message: 'New order email sent successfully'
      };
    } catch (error) {
      console.error('❌ Failed to send new order email:', error);
      throw new Error(`Failed to send new order email: ${error.message}`);
    }
  }

  async sendEmail({ to, subject, html, text, attachments = [] }) {
    if (!this.isReady) {
      throw new Error('Email service is not ready. Please check SMTP configuration.');
    }

    try {
      const mailOptions = {
        from: {
          name: emailConfig.from.name,
          address: emailConfig.from.address
        },
        to: to,
        subject: subject,
        html: html,
        text: text,
        attachments: attachments,
        headers: {
          'X-Mailer': 'Yield Mentor Email Service'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', {
        messageId: result.messageId,
        to: to,
        subject: subject
      });

      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  getStatus() {
    return {
      isReady: this.isReady,
      transporterConfigured: !!this.transporter,
      gmailUser: emailConfig.from.address
    };
  }
}

export default new EmailService();