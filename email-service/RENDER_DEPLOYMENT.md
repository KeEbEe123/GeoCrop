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

## Deployment Steps

1. Connect your GitHub repository to Render
2. Set the build command: `npm install`
3. Set the start command: `npm start`
4. Add all environment variables listed above
5. Deploy the service

## Troubleshooting

### SMTP Connection Issues
- Verify Gmail App Password is correct
- Check that 2FA is enabled on Gmail account
- Ensure "Less secure app access" is disabled (use App Password instead)

### CORS Issues
- Make sure FRONTEND_URL matches your actual frontend domain
- Check that the frontend is making requests to the correct email service URL

### Port Issues
- Render automatically handles port binding
- The service should bind to 0.0.0.0 in production mode