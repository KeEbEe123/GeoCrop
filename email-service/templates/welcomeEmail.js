import { emailConfig } from '../config/emailConfig.js';

export const generateWelcomeEmail = (userData) => {
  const { name, email, role, location } = userData;
  const { appUrl, supportEmail } = emailConfig;

  const roleSpecificContent = {
    farmer: {
      title: 'Welcome to GeoCrop - Start Selling Your Crops!',
      benefits: [
        'List your crops on our marketplace',
        'Connect directly with buyers',
        'Get AI-powered crop recommendations',
        'Access market analytics and pricing insights',
        'Manage orders and track sales'
      ],
      cta: 'List Your First Crop',
      ctaUrl: `${appUrl}/crops`
    },
    buyer: {
      title: 'Welcome to GeoCrop - Fresh Crops Await!',
      benefits: [
        'Browse fresh crops from local farmers',
        'Direct communication with sellers',
        'Quality assurance and ratings',
        'Convenient order management',
        'Support sustainable agriculture'
      ],
      cta: 'Start Shopping',
      ctaUrl: `${appUrl}/crops`
    },
    seller: {
      title: 'Welcome to GeoCrop - Grow Your Business!',
      benefits: [
        'Sell agricultural products and supplies',
        'Reach farmers across regions',
        'Manage inventory and orders',
        'Build customer relationships',
        'Access business analytics'
      ],
      cta: 'List Your Products',
      ctaUrl: `${appUrl}/products`
    }
  };

  const content = roleSpecificContent[role] || roleSpecificContent.farmer;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.title}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #22c55e;
                margin-bottom: 10px;
            }
            .title {
                color: #1f2937;
                font-size: 24px;
                margin-bottom: 20px;
            }
            .greeting {
                font-size: 18px;
                color: #4b5563;
                margin-bottom: 25px;
            }
            .benefits {
                background: #f0fdf4;
                border-left: 4px solid #22c55e;
                padding: 20px;
                margin: 25px 0;
                border-radius: 0 8px 8px 0;
            }
            .benefits h3 {
                color: #166534;
                margin-top: 0;
                margin-bottom: 15px;
            }
            .benefits ul {
                margin: 0;
                padding-left: 20px;
            }
            .benefits li {
                margin-bottom: 8px;
                color: #374151;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 25px 0;
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-2px);
            }
            .user-info {
                background: #f3f4f6;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
            }
            .user-info h3 {
                margin-top: 0;
                color: #374151;
            }
            .user-detail {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
            }
            .user-detail:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            .footer a {
                color: #22c55e;
                text-decoration: none;
            }
            .social-links {
                margin: 20px 0;
            }
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #6b7280;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🌱 Geo Crop</div>
                <h1 class="title">${content.title}</h1>
            </div>
            
            <div class="greeting">
                Hello <strong>${name}</strong>,
            </div>
            
            <p>Welcome to Geo Crop! We're thrilled to have you join our agricultural marketplace community. Your account has been successfully created and you're ready to start your journey with us.</p>
            
            <div class="user-info">
                <h3>Your Account Details</h3>
                <div class="user-detail">
                    <span><strong>Name:</strong></span>
                    <span>${name}</span>
                </div>
                <div class="user-detail">
                    <span><strong>Email:</strong></span>
                    <span>${email}</span>
                </div>
                <div class="user-detail">
                    <span><strong>Role:</strong></span>
                    <span style="text-transform: capitalize;">${role}</span>
                </div>
                <div class="user-detail">
                    <span><strong>Location:</strong></span>
                    <span>${location}</span>
                </div>
            </div>
            
            <div class="benefits">
                <h3>What you can do as a ${role}:</h3>
                <ul>
                    ${content.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${content.ctaUrl}" class="cta-button">${content.cta}</a>
            </div>
            
            <p>If you have any questions or need assistance getting started, our support team is here to help. Simply reply to this email or contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
            
            <p>Thank you for choosing Geo Crop. Together, we're building a more connected and sustainable agricultural future!</p>
            
            <div class="footer">
                <p>Best regards,<br>
                <strong>The Geo Crop Team</strong></p>
                
                <div class="social-links">
                    <a href="${appUrl}">Visit Platform</a> |
                    <a href="mailto:${supportEmail}">Support</a> |
                    <a href="${appUrl}/help">Help Center</a>
                </div>
                
                <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                    This email was sent to ${email} because you created an account on Geo Crop.<br>
                    If you didn't create this account, please contact our support team immediately.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  const textTemplate = `
    Welcome to Geo Crop!
    
    Hello ${name},
    
    Welcome to Geo Crop! We're thrilled to have you join our agricultural marketplace community.
    
    Your Account Details:
    - Name: ${name}
    - Email: ${email}
    - Role: ${role}
    - Location: ${location}
    
    What you can do as a ${role}:
    ${content.benefits.map(benefit => `• ${benefit}`).join('\n')}
    
    Get started: ${content.ctaUrl}
    
    If you have any questions, contact us at ${supportEmail}.
    
    Thank you for choosing Geo Crop!
    
    Best regards,
    The Geo Crop Team
  `;

  return {
    subject: content.title,
    html: htmlTemplate,
    text: textTemplate
  };
};