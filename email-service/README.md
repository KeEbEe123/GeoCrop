# Yield Mentor Email Service

A Node.js email service using Gmail SMTP and Nodemailer to send welcome emails and other notifications for the Yield Mentor agricultural marketplace platform.

## Features

- 📧 Gmail SMTP integration with App Password authentication
- 🎨 Beautiful HTML email templates with role-specific content
- 🔒 API key authentication and rate limiting
- 🚀 Express.js REST API
- 📊 Health check and status monitoring
- 🛡️ Security headers and CORS protection
- 📝 Comprehensive logging

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Gmail credentials
   ```

3. **Start the service**:
   ```bash
   npm run dev
   ```

4. **Test the service**:
   ```bash
   curl http://localhost:3001/api/email/health
   ```

## API Endpoints

- `GET /api/email/health` - Service health check
- `POST /api/email/send-welcome` - Send welcome email to new users
- `POST /api/email/send-email` - Send custom email
- `POST /api/email/test` - Send test email

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GMAIL_USER` | Your Gmail address | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |
| `API_KEY` | Service API key | `your-secure-api-key` |
| `PORT` | Service port | `3001` |
| `APP_URL` | Frontend URL | `http://localhost:5173` |

## Email Templates

### Welcome Email Features
- Role-specific content (Farmer, Buyer, Seller)
- User account details
- Platform benefits
- Call-to-action buttons
- Professional branding
- Responsive design

### Supported Roles
- **Farmer**: Crop selling and marketplace features
- **Buyer**: Fresh crop purchasing and quality assurance
- **Seller**: Product selling and business growth

## Security

- API key authentication required
- Rate limiting (100 requests/15min, 10 emails/min)
- CORS protection
- Helmet security headers
- Input validation

## Development

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## Integration

The service integrates with the Yield Mentor React app through the `emailServiceClient` in `src/services/emailService.ts`.

## Support

For setup instructions, see `../EMAIL_SERVICE_SETUP.md`