// Order status update email template for buyers
export const generateOrderStatusEmail = (orderData) => {
  const { 
    buyerName, 
    orderId, 
    itemName, 
    quantity, 
    status, 
    sellerName, 
    trackingId,
    expectedDelivery,
    totalAmount 
  } = orderData;

  const statusMessages = {
    pending: {
      subject: `Order Confirmation - ${itemName}`,
      title: 'Order Confirmed!',
      message: 'Your order has been confirmed and is being prepared for shipment.',
      color: '#f59e0b',
      icon: '⏳'
    },
    confirmed: {
      subject: `Order Processing - ${itemName}`,
      title: 'Order Being Processed',
      message: 'Great news! Your order is now being processed by the seller.',
      color: '#3b82f6',
      icon: '✅'
    },
    in_transit: {
      subject: `Order Shipped - ${itemName}`,
      title: 'Order On Its Way!',
      message: 'Your order has been shipped and is on its way to you.',
      color: '#8b5cf6',
      icon: '🚚'
    },
    delivered: {
      subject: `Order Delivered - ${itemName}`,
      title: 'Order Delivered Successfully!',
      message: 'Your order has been delivered. We hope you\'re satisfied with your purchase!',
      color: '#10b981',
      icon: '📦'
    },
    cancelled: {
      subject: `Order Cancelled - ${itemName}`,
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If you have any questions, please contact support.',
      color: '#ef4444',
      icon: '❌'
    }
  };

  const statusInfo = statusMessages[status] || statusMessages.pending;

  const subject = statusInfo.subject;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #e0e0e0; }
        .logo { font-size: 28px; font-weight: bold; color: #2d5016; margin-bottom: 10px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; background-color: ${statusInfo.color}; }
        .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { color: #333; }
        .cta-button { display: inline-block; padding: 12px 24px; background-color: #2d5016; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌾 GeoCrop</div>
          <h1>${statusInfo.icon} ${statusInfo.title}</h1>
          <div class="status-badge">${status.replace('_', ' ').toUpperCase()}</div>
        </div>
        
        <div style="padding: 20px 0;">
          <p>Hello ${buyerName},</p>
          <p>${statusInfo.message}</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <div class="detail-row">
              <span class="detail-label">Order ID:</span>
              <span class="detail-value">${orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Item:</span>
              <span class="detail-value">${itemName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Quantity:</span>
              <span class="detail-value">${quantity} units</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Seller:</span>
              <span class="detail-value">${sellerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value">₹${totalAmount.toLocaleString()}</span>
            </div>
            ${trackingId ? `
            <div class="detail-row">
              <span class="detail-label">Tracking ID:</span>
              <span class="detail-value">${trackingId}</span>
            </div>
            ` : ''}
            ${expectedDelivery ? `
            <div class="detail-row">
              <span class="detail-label">Expected Delivery:</span>
              <span class="detail-value">${new Date(expectedDelivery).toLocaleDateString()}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/orders" class="cta-button">
              View Order Details
            </a>
          </div>
          
          ${status === 'delivered' ? `
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📝 Rate Your Experience</strong></p>
            <p>How was your experience with this order? Your feedback helps us improve our platform and helps other buyers make informed decisions.</p>
            <div style="text-align: center;">
              <a href="${process.env.APP_URL || 'http://localhost:5173'}/orders" style="display: inline-block; padding: 8px 16px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px;">
                Rate This Order
              </a>
            </div>
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Thank you for choosing GeoCrop!</p>
          <p>If you have any questions, please contact our support team.</p>
          <p><a href="mailto:${process.env.SUPPORT_EMAIL || 'support@geocrop.com'}">${process.env.SUPPORT_EMAIL || 'support@geocrop.com'}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${statusInfo.title}
    
    Hello ${buyerName},
    
    ${statusInfo.message}
    
    Order Details:
    - Order ID: ${orderId}
    - Item: ${itemName}
    - Quantity: ${quantity} units
    - Seller: ${sellerName}
    - Total Amount: ₹${totalAmount.toLocaleString()}
    ${trackingId ? `- Tracking ID: ${trackingId}` : ''}
    ${expectedDelivery ? `- Expected Delivery: ${new Date(expectedDelivery).toLocaleDateString()}` : ''}
    
    View your order details: ${process.env.APP_URL || 'http://localhost:5173'}/orders
    
    Thank you for choosing GeoCrop!
    
    If you have any questions, please contact our support team at ${process.env.SUPPORT_EMAIL || 'support@geocrop.com'}.
  `;

  return { subject, html, text };
};