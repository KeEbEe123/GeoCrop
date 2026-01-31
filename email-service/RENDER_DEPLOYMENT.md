# Email Service Render Deployment Guide

## Environment Variables to Set in Render Dashboard

When deploying to Render, set these environment variables in your service settings:

### Required Variables
```
NODE_ENV=production
PORT=10000
GMAIL_USER=keertan.k@gmail.com
GMAIL_APP_PASSWORD=blox fkah xvfe ichm
API_KEY=ym-email-service-2024-secure-key
APP_NAME=Yield Mentor
APP_URL=https://geocropemailer.onrender.com
SUPPORT_EMAIL=support@yieldmentor.com
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Important Notes

1. **Port**: Render automatically assigns a port, but we default to 10000
2. **Gmail App Password**: Make sure this is a valid Gmail App Password, not your regular password
3. **Frontend URL**: Replace with your actual frontend deployment URL
4. **NODE_ENV**: Must be set to "production" for proper CORS handling

## Recent Fixes for Render Deployment

### SMTP Timeout Issues Fixed ✅
- Reduced connection timeouts from 60s to 30s for faster failure detection
- Added connection pooling for better performance
- Implemented exponential backoff retry logic (3 attempts with 2s, 4s, 6s delays)
- Service now starts even if initial SMTP verification fails
- Automatic reconnection attempts on first email send

### Cloud Platform Optimizations ✅
- Server now binds to `0.0.0.0` in production (required for Render)
- Enhanced TLS settings for cloud environments
- Connection pooling with max 5 connections, 100 messages per connection
- Improved error handling and logging for production debugging

### Health Check Enhancements ✅
- Enhanced health endpoint at `/api/email/health`
- Optional SMTP connection test: `/api/email/health?testSmtp=true`
- Detailed service status including memory usage and uptime
- Masked email credentials in health responses

## Deployment Steps

1. Connect your GitHub repository to Render
2. Set the build command: `npm install`
3. Set the start command: `npm start`
4. Add all environment variables listed above
5. Deploy the service

## Testing the Deployment

### 1. Basic Health Check
```bash
curl https://your-service-url.onrender.com/api/email/health
```

### 2. SMTP Connection Test
```bash
curl "https://your-service-url.onrender.com/api/email/health?testSmtp=true"
```

### 3. Send Test Email
```bash
curl -X POST https://your-service-url.onrender.com/api/email/test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ym-email-service-2024-secure-key" \
  -d '{"email": "test@example.com"}'
```

## Troubleshooting

### SMTP Connection Issues
- ✅ **Fixed**: Timeout errors on Render - now uses optimized timeouts and retry logic
- ✅ **Fixed**: Service startup failures - service now starts even with SMTP issues
- Verify Gmail App Password is correct and not expired
- Check that 2FA is enabled on Gmail account
- Ensure "Less secure app access" is disabled (use App Password instead)

### Service Startup Issues
- ✅ **Fixed**: Host binding issues - now binds to 0.0.0.0 in production
- Check Render logs for specific error messages
- Verify all required environment variables are set
- Ensure PORT is not hardcoded (Render assigns it dynamically)

### Email Sending Failures
- ✅ **Fixed**: Connection drops - now has automatic reconnection
- ✅ **Fixed**: Timeout errors - now has proper retry logic with exponential backoff
- Use health check with SMTP test to verify connection
- Check Render logs for detailed error messages

### CORS Issues
- Make sure FRONTEND_URL matches your actual frontend domain
- Check that the frontend is making requests to the correct email service URL
- Verify API key is being sent in requests

## Performance Optimizations

The service now includes:
- Connection pooling for better resource usage
- Retry logic with exponential backoff
- Graceful degradation (service starts even with SMTP issues)
- Enhanced logging for production debugging
- Memory and uptime monitoring in health checks

## Monitoring

Monitor your service using:
- Render's built-in logs and metrics
- Health endpoint: `/api/email/health`
- SMTP test endpoint: `/api/email/health?testSmtp=true`
- Service status in application responses