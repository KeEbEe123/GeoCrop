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
      this.transporter = createTransporter();
      this.isReady = await verifyTransporter(this.transporter);
      return this.isReady;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isReady = false;
      return false;
    }
  }

  async sendWelcomeEmail(userData) {
    if (!this.isReady) {
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