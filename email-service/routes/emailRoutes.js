import express from 'express';
import emailService from '../services/emailService.js';
import { authenticateApiKey, validateEmailData } from '../middleware/auth.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const status = emailService.getStatus();
  res.json({
    success: true,
    message: 'Email service is running',
    status: status,
    timestamp: new Date().toISOString()
  });
});

// Send welcome email endpoint
router.post('/send-welcome', authenticateApiKey, validateEmailData, async (req, res) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role || 'farmer',
      location: req.body.location || 'Not specified'
    };

    const result = await emailService.sendWelcomeEmail(userData);
    
    res.json({
      success: true,
      message: 'Welcome email sent successfully',
      data: {
        messageId: result.messageId,
        to: userData.email
      }
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send welcome email'
    });
  }
});

// Send order status update email endpoint
router.post('/send-order-status', authenticateApiKey, async (req, res) => {
  try {
    const orderData = {
      buyerName: req.body.buyerName,
      buyerEmail: req.body.buyerEmail,
      orderId: req.body.orderId,
      itemName: req.body.itemName,
      quantity: req.body.quantity,
      status: req.body.status,
      sellerName: req.body.sellerName,
      trackingId: req.body.trackingId,
      expectedDelivery: req.body.expectedDelivery,
      totalAmount: req.body.totalAmount
    };

    if (!orderData.buyerEmail || !orderData.orderId || !orderData.status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: buyerEmail, orderId, and status'
      });
    }

    const result = await emailService.sendOrderStatusEmail(orderData);
    
    res.json({
      success: true,
      message: 'Order status email sent successfully',
      data: {
        messageId: result.messageId,
        to: orderData.buyerEmail
      }
    });
  } catch (error) {
    console.error('Error sending order status email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send order status email'
    });
  }
});

// Send new order notification email endpoint
router.post('/send-new-order', authenticateApiKey, async (req, res) => {
  try {
    const orderData = {
      sellerName: req.body.sellerName,
      sellerEmail: req.body.sellerEmail,
      orderId: req.body.orderId,
      itemName: req.body.itemName,
      quantity: req.body.quantity,
      buyerName: req.body.buyerName,
      buyerLocation: req.body.buyerLocation,
      totalAmount: req.body.totalAmount,
      orderDate: req.body.orderDate,
      expectedDelivery: req.body.expectedDelivery,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod || 'Not specified',
      paymentStatus: req.body.paymentStatus || 'pending'
    };

    if (!orderData.sellerEmail || !orderData.orderId || !orderData.itemName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sellerEmail, orderId, and itemName'
      });
    }

    const result = await emailService.sendNewOrderEmail(orderData);
    
    res.json({
      success: true,
      message: 'New order email sent successfully',
      data: {
        messageId: result.messageId,
        to: orderData.sellerEmail
      }
    });
  } catch (error) {
    console.error('Error sending new order email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send new order email'
    });
  }
});

// Send custom email endpoint
router.post('/send-email', authenticateApiKey, async (req, res) => {
  try {
    const { to, subject, html, text, attachments } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, and either html or text'
      });
    }

    const result = await emailService.sendEmail({
      to,
      subject,
      html,
      text,
      attachments
    });
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        messageId: result.messageId,
        to: to
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email'
    });
  }
});

// Test email endpoint (for development)
router.post('/test', authenticateApiKey, async (req, res) => {
  try {
    const testEmail = {
      to: req.body.email || 'test@example.com',
      subject: 'Test Email from Yield Mentor',
      html: '<h1>Test Email</h1><p>This is a test email from Yield Mentor email service.</p>',
      text: 'Test Email\n\nThis is a test email from Yield Mentor email service.'
    };

    const result = await emailService.sendEmail(testEmail);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        messageId: result.messageId,
        to: testEmail.to
      }
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send test email'
    });
  }
});

export default router;