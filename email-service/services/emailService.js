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
      console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
      
      this.transporter = createTransporter();
      
      // Always attempt verification, but handle failures gracefully in production
      console.log('🔍 Attempting SMTP verification...');
      this.isReady = await verifyTransporter(this.transporter);
      
      if (this.isReady) {
        console.log('✅ Email service initialized successfully');
      } else {
        console.warn('⚠️  Email service initialized with connection issues');
        if (process.env.NODE_ENV === 'production') {
          console.warn('⚠️  Will retry connection on first email send attempt');
        }
      }
      
      return true; // Always return true to allow service to start
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.isReady = false;
      
      // In production, still allow service to start
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️  Service starting despite initialization error');
        return true;
      }
      
      return false;
    }
  }

  async sendWelcomeEmail(userData) {
    return await this.sendEmailWithRetry(async () => {
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

      const result = await this.transporter.sendMail(mailOptions);
      
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
    }, 'welcome email');
  }

  async sendEmailWithRetry(emailFunction, emailType = 'email') {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Ensure we have a transporter and try to reconnect if needed
        if (!this.transporter || !this.isReady) {
          console.log(`📧 Reinitializing email service for ${emailType} (attempt ${attempt})...`);
          this.transporter = createTransporter();
          
          // Quick verification attempt (shorter timeout for retries)
          try {
            const verificationPromise = verifyTransporter(this.transporter);
            const quickTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Quick verification timeout')), 10000)
            );
            
            this.isReady = await Promise.race([verificationPromise, quickTimeout]);
          } catch (verifyError) {
            console.warn(`⚠️  Quick verification failed on attempt ${attempt}:`, verifyError.message);
            // In production, try to send anyway
            if (process.env.NODE_ENV === 'production') {
              console.warn('⚠️  Attempting to send email without verification...');
              this.isReady = false; // But mark as not ready
            } else {
              throw verifyError;
            }
          }
        }

        // Execute the email function
        const result = await emailFunction();
        
        // Mark as ready if send was successful
        this.isReady = true;
        return result;

      } catch (error) {
        lastError = error;
        console.error(`❌ ${emailType} send attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        // Reset connection state on error
        this.isReady = false;
        
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
          console.log(`⏳ Waiting ${delay/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error(`❌ Failed to send ${emailType} after ${maxRetries} attempts`);
    throw new Error(`Failed to send ${emailType}: ${lastError.message}`);
  }

  async sendOrderStatusEmail(orderData) {
    return await this.sendEmailWithRetry(async () => {
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
          'X-Mailer': 'Yield Mentor Email Service',
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
    }, 'order status email');
  }

  async sendNewOrderEmail(orderData) {
    return await this.sendEmailWithRetry(async () => {
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
          'X-Mailer': 'Yield Mentor Email Service',
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
    }, 'new order email');
  }

  async sendEmail({ to, subject, html, text, attachments = [] }) {
    return await this.sendEmailWithRetry(async () => {
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
    }, 'custom email');
  }

  getStatus() {
    return {
      isReady: this.isReady,
      transporterConfigured: !!this.transporter,
      gmailUser: emailConfig.from.address
    };
  }

  async testConnection() {
    try {
      if (!this.transporter) {
        this.transporter = createTransporter();
      }
      
      // Quick connection test with timeout
      const verificationPromise = this.transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), 15000)
      );
      
      await Promise.race([verificationPromise, timeoutPromise]);
      this.isReady = true;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      this.isReady = false;
      throw error;
    }
  }
}

export default new EmailService();