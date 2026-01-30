# Email Service Setup Guide

This guide will help you set up Gmail SMTP with Nodemailer to send welcome emails when users sign up to the Yield Mentor platform.

## Prerequisites

- Node.js (v16 or higher)
- Gmail account
- Gmail App Password (not your regular password)

## Step 1: Gmail Configuration

### Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

### Generate App Password
1. Go to Google Account settings > Security
2. Under "2-Step Verification", click on "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Enter "Yield Mentor Email Service"
5. Copy the generated 16-character password

## Step 2: Install Email Service Dependencies

Navigate to the email service directory and install dependencies:

```bash
cd email-service
npm install
```

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your Gmail credentials:
```env
# Email Service Configuration
PORT=3001

# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Application Configuration
APP_NAME=Yield Mentor
APP_URL=http://localhost:5173
SUPPORT_EMAIL=support@yieldmentor.com

# Security
API_KEY=ym-email-service-2024-secure-key

# Environment
NODE_ENV=development
```

**Important**: Replace `your-email@gmail.com` with your Gmail address and `your-16-character-app-password` with the App Password you generated.

## Step 4: Start the Email Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will start on port 3001 by default.

## Step 5: Test the Email Service

### Health Check
```bash
curl http://localhost:3001/api/email/health
```

### Send Test Email
```bash
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ym-email-service-2024-secure-key" \
  -d '{"email": "test@example.com"}'
```

### Send Welcome Email
```bash
curl -X POST http://localhost:3001/api/email/send-welcome \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ym-email-service-2024-secure-key" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "farmer",
    "location": "California, USA"
  }'
```

## Step 6: Integration with React App

The React app is already configured to use the email service. Make sure your main `.env` file has:

```env
# Email Service Configuration
VITE_EMAIL_SERVICE_URL=http://localhost:3001
VITE_EMAIL_API_KEY=ym-email-service-2024-secure-key
```

## Step 7: Running Both Services

### Terminal 1 - React App
```bash
npm run dev
```

### Terminal 2 - Email Service
```bash
cd email-service
npm run dev
```

## API Endpoints

### GET /api/email/health
Check service health and SMTP connection status.

### POST /api/email/send-welcome
Send welcome email to new users.
**Headers**: `X-API-Key: your-api-key`
**Body**:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "role": "farmer|buyer|seller",
  "location": "User Location"
}
```

### POST /api/email/send-email
Send custom email.
**Headers**: `X-API-Key: your-api-key`
**Body**:
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<h1>HTML Content</h1>",
  "text": "Plain text content"
}
```

### POST /api/email/test
Send test email for debugging.
**Headers**: `X-API-Key: your-api-key`
**Body**:
```json
{
  "email": "test@example.com"
}
```

## Security Features

- API Key authentication
- Rate limiting (100 requests per 15 minutes, 10 email requests per minute)
- CORS protection
- Helmet security headers
- Input validation

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Make sure you're using an App Password, not your regular Gmail password
   - Verify 2-Factor Authentication is enabled

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify Gmail SMTP settings
   - Try using port 465 with secure: true

3. **"API key required" error**
   - Make sure you're sending the `X-API-Key` header
   - Verify the API key matches the one in your `.env` file

4. **Email not received**
   - Check spam/junk folder
   - Verify the recipient email address
   - Check email service logs for errors

### Logs

The email service provides detailed logging:
- ✅ Success messages (green checkmark)
- ❌ Error messages (red X)
- ⚠️ Warning messages (yellow warning)

## Production Deployment

For production deployment:

1. Update environment variables for production
2. Use a process manager like PM2
3. Set up proper logging
4. Configure firewall rules
5. Use HTTPS for API endpoints
6. Consider using a dedicated email service like SendGrid or AWS SES for higher volume

## Email Templates

The welcome email template is customized based on user role:

- **Farmers**: Focus on selling crops and marketplace features
- **Buyers**: Emphasize finding fresh crops and quality assurance
- **Sellers**: Highlight product selling and business growth

Templates are responsive and include:
- Professional branding
- User account details
- Role-specific benefits
- Call-to-action buttons
- Support contact information

## Support

If you encounter any issues:
1. Check the logs in the email service terminal
2. Verify your Gmail App Password is correct
3. Test with the health check endpoint
4. Contact support at the configured support email