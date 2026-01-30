// New order notification email template for farmers/sellers
export const generateNewOrderEmail = (orderData) => {
  const { 
    sellerName, 
    orderId, 
    itemName, 
    quantity, 
    buyerName,
    buyerLocation,
    totalAmount,
    orderDate,
    expectedDelivery,
    shippingAddress,
    paymentMethod,
    paymentStatus
  } = orderData;

  const subject = `New Order Received - ${itemName}`;

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
        .alert-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; background-color: #10b981; }
        .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .buyer-details { background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { color: #333; }
        .cta-button { display: inline-block; padding: 12px 24px; background-color: #2d5016; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .secondary-button { display: inline-block; padding: 12px 24px; background-color: #6b7280; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px; }
        .urgent { background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌾 GeoCrop</div>
          <h1>🎉 New Order Received!</h1>
          <div class="alert-badge">ACTION REQUIRED</div>
        </div>
        
        <div style="padding: 20px 0;">
          <p>Hello ${sellerName},</p>
          <p>Great news! You have received a new order for your <strong>${itemName}</strong>. Please review the details below and take action to confirm and process this order.</p>
          
          <div class="urgent">
            <p><strong>⏰ Time Sensitive:</strong> Please confirm this order within 24 hours to maintain your seller rating and ensure customer satisfaction.</p>
          </div>
          
          <div class="order-details">
            <h3>📦 Order Information</h3>
            <div class="detail-row">
              <span class="detail-label">Order ID:</span>
              <span class="detail-value">${orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Item:</span>
              <span class="detail-value">${itemName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Quantity Ordered:</span>
              <span class="detail-value">${quantity} units</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value"><strong>₹${totalAmount.toLocaleString()}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Date:</span>
              <span class="detail-value">${new Date(orderDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Expected Delivery:</span>
              <span class="detail-value">${expectedDelivery ? new Date(expectedDelivery).toLocaleDateString() : 'To be determined'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="detail-value" style="color: ${paymentStatus === 'paid' ? '#10b981' : '#f59e0b'};">
                ${paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div class="buyer-details">
            <h3>👤 Buyer Information</h3>
            <div class="detail-row">
              <span class="detail-label">Buyer Name:</span>
              <span class="detail-value">${buyerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${buyerLocation}</span>
            </div>
            ${shippingAddress ? `
            <div class="detail-row">
              <span class="detail-label">Shipping Address:</span>
              <span class="detail-value">${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <h3>What's Next?</h3>
            <p>Take action on this order to keep your customers happy:</p>
            
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/orders" class="cta-button">
              ✅ Confirm Order
            </a>
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/orders" class="secondary-button">
              📋 View All Orders
            </a>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>💡 Pro Tips for Success:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Confirm orders quickly to build buyer trust</li>
              <li>Communicate any delays or issues promptly</li>
              <li>Ensure quality packaging for safe delivery</li>
              <li>Update order status regularly</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for being a valued seller on GeoCrop!</p>
          <p>Questions? Contact our seller support team.</p>
          <p><a href="mailto:${process.env.SUPPORT_EMAIL || 'support@geocrop.com'}">${process.env.SUPPORT_EMAIL || 'support@geocrop.com'}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    New Order Received!
    
    Hello ${sellerName},
    
    Great news! You have received a new order for your ${itemName}. Please review the details below and take action to confirm and process this order.
    
    ⏰ IMPORTANT: Please confirm this order within 24 hours to maintain your seller rating.
    
    Order Information:
    - Order ID: ${orderId}
    - Item: ${itemName}
    - Quantity: ${quantity} units
    - Total Amount: ₹${totalAmount.toLocaleString()}
    - Order Date: ${new Date(orderDate).toLocaleDateString()}
    - Expected Delivery: ${expectedDelivery ? new Date(expectedDelivery).toLocaleDateString() : 'To be determined'}
    - Payment Method: ${paymentMethod}
    - Payment Status: ${paymentStatus.toUpperCase()}
    
    Buyer Information:
    - Buyer Name: ${buyerName}
    - Location: ${buyerLocation}
    ${shippingAddress ? `- Shipping Address: ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}` : ''}
    
    Take action: ${process.env.APP_URL || 'http://localhost:5173'}/orders
    
    Thank you for being a valued seller on GeoCrop!
    
    Questions? Contact our seller support team at ${process.env.SUPPORT_EMAIL || 'support@geocrop.com'}.
  `;

  return { subject, html, text };
};